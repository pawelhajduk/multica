"use client";

import { memo } from "react";
import { Card } from "@multica/ui/components/ui/card";
import type { AgentTask } from "@multica/core/types";
import { useActorName } from "@multica/core/workspace/hooks";
import { ActorAvatar } from "../../common/actor-avatar";
import { TranscriptButton } from "../../common/task-transcript";
import { formatDuration } from "../../agents/components/agent-activity-hover-content";
import { useT } from "../../i18n";

interface PendingExecutionCardProps {
  task: AgentTask;
  /**
   * Live clock in ms, driven by the single shared 1 Hz ticker in
   * use-issue-timeline so the virtualized list runs ONE interval rather than
   * one per card.
   */
  nowMs: number;
  /**
   * Delegate opening the run transcript to a parent-owned dialog host
   * (issue-detail). Required because this card unmounts the instant the run
   * resolves into its result comment — a row-owned live dialog would die
   * mid-watch at exactly that moment. The host survives the unmount.
   */
  onOpenRun?: (taskId: string) => void;
}

// "Working now" status word. The word — not the colour or the pulse — is what
// carries the state for users who can't perceive either (WCAG 1.4.1), and it
// stays honest: a queued run reads "Queued", not "Working".
function useStatusWord(status: AgentTask["status"]): string {
  const { t } = useT("issues");
  switch (status) {
    case "queued":
      return t(($) => $.pending_execution.queued);
    case "dispatched":
      return t(($) => $.pending_execution.starting);
    case "waiting_local_directory":
      return t(($) => $.pending_execution.waiting_local_directory);
    default:
      // running, plus the brief terminal-hold window before the result comment
      // lands — both read as actively wrapping up.
      return t(($) => $.pending_execution.working);
  }
}

/**
 * Inline comments-timeline entry for an agent run that is pending / in progress.
 * Styled to match CommentCard so it resolves in place into the result comment
 * with no horizontal jump: same `Card` shell, a non-interactive spacer in the
 * chevron slot, avatar size 24, `gap-2.5`, header `px-4 py-3`.
 *
 * Surfaces the four v1 elements: the agent's identity, a clear "working"
 * indication, the elapsed time, and an action to expand the run transcript.
 */
function PendingExecutionCardImpl({
  task,
  nowMs,
  onOpenRun,
}: PendingExecutionCardProps) {
  const { t } = useT("issues");
  const { getActorName } = useActorName();
  const agentName = task.agent_id
    ? getActorName("agent", task.agent_id)
    : t(($) => $.pending_execution.fallback_name);
  const statusWord = useStatusWord(task.status);
  const elapsed = formatDuration(task.started_at ?? task.created_at, nowMs);

  // Transcript is only meaningful once the agent has begun streaming output —
  // a pure-queued / path-locked run hasn't produced anything to expand yet.
  const showExpand =
    task.status !== "queued" && task.status !== "waiting_local_directory";

  return (
    <Card className="!py-0 !gap-0 overflow-clip">
      <div className="flex items-center gap-2.5 px-4 py-3">
        {/* Chevron-slot spacer — CommentCard leads its header with a collapse
            chevron (`h-3.5 w-3.5` + `p-0.5`) before the avatar. A pending card
            has nothing to collapse, so we reserve the same width to keep the
            avatar column aligned with the real comments around it and avoid a
            horizontal jump on resolve. */}
        <span className="shrink-0 p-0.5" aria-hidden="true">
          <span className="block h-3.5 w-3.5" />
        </span>
        <ActorAvatar
          actorType="agent"
          actorId={task.agent_id}
          size={24}
          enableHoverCard
          showStatusDot
        />
        <span className="shrink-0 text-sm font-medium">{agentName}</span>

        {/* Working indicator: word + live elapsed, with a pulsing ring (not a
            fading dot) so the solid `bg-info` dot itself never drops below the
            3:1 non-text contrast floor (WCAG 1.4.11), and `motion-safe` so the
            animation is absent under prefers-reduced-motion (WCAG 2.3.3). */}
        <span className="flex min-w-0 items-center gap-1.5 text-info">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-info opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-info" />
          </span>
          <span className="text-xs font-medium">{statusWord}</span>
          {elapsed && (
            <span className="text-xs tabular-nums text-info/80">{elapsed}</span>
          )}
        </span>

        {showExpand && (
          <div className="ml-auto flex items-center">
            <TranscriptButton
              task={task}
              agentName={agentName}
              isLive
              onOpen={onOpenRun}
              title={t(($) => $.pending_execution.expand_aria, {
                name: agentName,
              })}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export const PendingExecutionCard = memo(PendingExecutionCardImpl);
