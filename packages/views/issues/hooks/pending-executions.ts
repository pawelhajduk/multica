import type { AgentTask, TimelineEntry } from "@multica/core/types";

// Active (non-terminal) task statuses. A run in any of these is "working now"
// and gets an inline pending-execution entry in the comments timeline.
export const PENDING_ACTIVE_STATUSES: ReadonlySet<AgentTask["status"]> =
  new Set<AgentTask["status"]>([
    "queued",
    "dispatched",
    // Daemon-parked on a busy local_directory path lock — still active, just
    // waiting to resume. Surfacing it is what tells the user the agent is alive.
    "waiting_local_directory",
    "running",
  ]);

// Hard-timeout safety net for the resolution gate below. A `completed` /
// non-retried `failed` task is held until its resolving comment lands (so the
// timeline never shows a zero-entry gap during the WS race), but if that
// comment somehow never arrives we drop the entry after this grace window so a
// `working`-styled card can't linger forever.
export const RESOLUTION_GRACE_MS = 10_000;

// Does an agent-authored comment for this run already exist in the timeline?
// Keys on author identity + time (NOT comment_type): a `failed`, non-retried
// task posts a `system`-type comment authored by the agent, and that message
// is a perfectly good thing to resolve the card into. Anchors on
// `started_at ?? created_at` (started_at is null for queued tasks) so an
// agent's earlier comment in the same thread doesn't count as this run's
// resolution.
function hasResolvingComment(task: AgentTask, timeline: TimelineEntry[]): boolean {
  if (!task.agent_id) return false;
  const anchor = new Date(task.started_at ?? task.created_at).getTime();
  return timeline.some(
    (e) =>
      e.type === "comment" &&
      e.actor_type === "agent" &&
      e.actor_id === task.agent_id &&
      new Date(e.created_at).getTime() >= anchor,
  );
}

/**
 * Derive the set of pending-execution entries to render inline in the comments
 * timeline from the per-issue task list, the comment timeline, and the current
 * clock.
 *
 * The resolution rule is what keeps "exactly one entry visible at every step —
 * never zero, never two" across the independent WS orderings of `task:*` and
 * `comment:created`:
 *
 *   - active (queued/dispatched/waiting_local_directory/running): show the
 *     entry UNLESS its resolving comment has already landed (comment-first
 *     ordering) — that suppression prevents the brief double.
 *   - completed / non-retried failed: HOLD the entry until the resolving
 *     comment is present (gating removal on the comment, not on active-state,
 *     is what closes the task-first zero-gap), then drop. A hard timeout is the
 *     safety net for a comment that never arrives.
 *   - cancelled: drop immediately — no comment is ever posted.
 *   - retried failed (a child task with parent_task_id === this task exists):
 *     drop immediately — the failure is silent and a fresh task takes over.
 */
export function computePendingExecutions(
  tasks: AgentTask[],
  timeline: TimelineEntry[],
  nowMs: number,
): AgentTask[] {
  // Parents that have already been auto-retried — their failure is silent.
  const retriedParentIds = new Set<string>();
  for (const t of tasks) {
    if (t.parent_task_id) retriedParentIds.add(t.parent_task_id);
  }

  const result: AgentTask[] = [];
  for (const task of tasks) {
    if (!task.agent_id) continue;
    const resolved = hasResolvingComment(task, timeline);

    if (PENDING_ACTIVE_STATUSES.has(task.status)) {
      if (!resolved) result.push(task);
      continue;
    }
    if (task.status === "cancelled") continue;
    if (task.status === "failed" && retriedParentIds.has(task.id)) continue;
    if (task.status === "completed" || task.status === "failed") {
      if (resolved) continue;
      const completedAt = task.completed_at
        ? new Date(task.completed_at).getTime()
        : new Date(task.started_at ?? task.created_at).getTime();
      if (nowMs - completedAt > RESOLUTION_GRACE_MS) continue;
      result.push(task);
    }
  }
  return result;
}

// True when at least one task is a candidate for an inline entry right now
// (active, or terminal-but-awaiting-its-resolving-comment). Used to gate the
// shared 1 Hz ticker so idle issues pay nothing.
export function hasPendingExecutionCandidate(tasks: AgentTask[]): boolean {
  const retriedParentIds = new Set<string>();
  for (const t of tasks) {
    if (t.parent_task_id) retriedParentIds.add(t.parent_task_id);
  }
  return tasks.some((task) => {
    if (!task.agent_id) return false;
    if (PENDING_ACTIVE_STATUSES.has(task.status)) return true;
    if (task.status === "cancelled") return false;
    if (task.status === "failed" && retriedParentIds.has(task.id)) return false;
    return task.status === "completed" || task.status === "failed";
  });
}
