import { describe, it, expect } from "vitest";
import type { AgentTask, TimelineEntry } from "@multica/core/types";
import {
  computePendingExecutions,
  hasPendingExecutionCandidate,
  RESOLUTION_GRACE_MS,
} from "./pending-executions";

const T0 = Date.parse("2026-06-17T10:00:00Z");

function task(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: "task-1",
    agent_id: "agent-1",
    runtime_id: "rt-1",
    issue_id: "issue-1",
    status: "running",
    priority: 0,
    dispatched_at: null,
    started_at: "2026-06-17T10:00:00Z",
    completed_at: null,
    result: null,
    error: null,
    created_at: "2026-06-17T10:00:00Z",
    ...overrides,
  };
}

function agentComment(overrides: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    type: "comment",
    id: "c-result",
    actor_type: "agent",
    actor_id: "agent-1",
    content: "Done.",
    parent_id: null,
    created_at: "2026-06-17T10:05:00Z",
    updated_at: "2026-06-17T10:05:00Z",
    comment_type: "comment",
    ...overrides,
  } as TimelineEntry;
}

describe("computePendingExecutions", () => {
  it("shows an active run that has no resolving comment yet", () => {
    const out = computePendingExecutions([task()], [], T0 + 1000);
    expect(out.map((t) => t.id)).toEqual(["task-1"]);
  });

  it("queued / dispatched / waiting_local_directory all count as active", () => {
    const tasks = [
      task({ id: "q", status: "queued", started_at: null }),
      task({ id: "d", status: "dispatched" }),
      task({ id: "w", status: "waiting_local_directory" }),
    ];
    const out = computePendingExecutions(tasks, [], T0 + 1000);
    expect(out.map((t) => t.id).sort()).toEqual(["d", "q", "w"]);
  });

  // --- The resolution race: exactly one entry at every step (never 0, never 2) ---

  it("comment-first ordering: an active run is suppressed once its agent comment lands (never two)", () => {
    // task still 'running', but the result comment arrived first.
    const out = computePendingExecutions(
      [task({ status: "running" })],
      [agentComment()],
      T0 + 2000,
    );
    expect(out).toHaveLength(0); // the comment is the single visible entry
  });

  it("task-first ordering: a completed run is held until its comment lands (never zero)", () => {
    // task is 'completed', but the result comment has not arrived yet.
    const out = computePendingExecutions(
      [task({ status: "completed", completed_at: "2026-06-17T10:04:00Z" })],
      [],
      T0 + 5000, // within the grace window
    );
    expect(out.map((t) => t.id)).toEqual(["task-1"]); // entry held, no gap
  });

  it("completed + resolving comment present → entry drops (resolved in place)", () => {
    const out = computePendingExecutions(
      [task({ status: "completed", completed_at: "2026-06-17T10:04:00Z" })],
      [agentComment()],
      T0 + 5000,
    );
    expect(out).toHaveLength(0);
  });

  it("a non-retried failure resolves into its system comment", () => {
    // failed tasks post a `system`-type comment authored by the agent; keying
    // on author identity (not comment_type) means it still resolves the card.
    const out = computePendingExecutions(
      [task({ status: "failed", completed_at: "2026-06-17T10:04:00Z" })],
      [agentComment({ id: "c-sys", comment_type: "system" })],
      T0 + 5000,
    );
    expect(out).toHaveLength(0);
  });

  it("cancelled runs drop immediately — no comment is ever posted", () => {
    const out = computePendingExecutions(
      [task({ status: "cancelled", completed_at: "2026-06-17T10:04:00Z" })],
      [],
      T0 + 1000,
    );
    expect(out).toHaveLength(0);
  });

  it("a retried failure drops immediately — the fresh task takes over", () => {
    const tasks = [
      task({ id: "parent", status: "failed", completed_at: "2026-06-17T10:04:00Z" }),
      task({ id: "child", status: "running", parent_task_id: "parent" }),
    ];
    const out = computePendingExecutions(tasks, [], T0 + 1000);
    expect(out.map((t) => t.id)).toEqual(["child"]); // parent gone, child shown
  });

  it("hard-timeout drops a terminal run whose comment never arrived", () => {
    const out = computePendingExecutions(
      [task({ status: "completed", completed_at: "2026-06-17T10:04:00Z" })],
      [],
      Date.parse("2026-06-17T10:04:00Z") + RESOLUTION_GRACE_MS + 1,
    );
    expect(out).toHaveLength(0);
  });

  it("an agent comment from BEFORE the run started does not resolve it", () => {
    const earlier = agentComment({
      id: "c-old",
      created_at: "2026-06-17T09:59:00Z",
    });
    const out = computePendingExecutions([task()], [earlier], T0 + 1000);
    expect(out.map((t) => t.id)).toEqual(["task-1"]); // still working
  });
});

describe("hasPendingExecutionCandidate", () => {
  it("is true while any run is active or awaiting its resolving comment", () => {
    expect(hasPendingExecutionCandidate([task()])).toBe(true);
    expect(
      hasPendingExecutionCandidate([task({ status: "completed" })]),
    ).toBe(true);
  });

  it("is false when every run is cancelled / retried / done-and-irrelevant", () => {
    expect(
      hasPendingExecutionCandidate([task({ status: "cancelled" })]),
    ).toBe(false);
    expect(
      hasPendingExecutionCandidate([
        task({ id: "p", status: "failed" }),
        task({ id: "c", status: "running", parent_task_id: "p" }),
      ]),
    ).toBe(true); // the child is active
  });
});
