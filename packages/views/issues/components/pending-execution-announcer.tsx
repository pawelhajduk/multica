"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentTask } from "@multica/core/types";
import { useActorName } from "@multica/core/workspace/hooks";
import { useT } from "../../i18n";

interface PendingExecutionAnnouncerProps {
  /** The runs currently shown as inline pending-execution entries. */
  tasks: AgentTask[];
}

/**
 * Single `aria-live="polite"` region for the inline pending-execution entries.
 * The whole point of the feature is to end "is it running?" silence, so a
 * silent DOM insert/remove would recreate that silence for screen-reader users
 * (WCAG 4.1.3). This lives OUTSIDE the cards — a card announcing its own
 * resolution is impossible because it unmounts at that exact moment — and
 * diffs the shown-run set across renders: a newly-appeared run announces
 * "{agent} started working"; a disappeared run announces "{agent} finished".
 */
export function PendingExecutionAnnouncer({
  tasks,
}: PendingExecutionAnnouncerProps) {
  const { t } = useT("issues");
  const { getActorName } = useActorName();
  const prevRef = useRef<Map<string, string>>(new Map());
  const [message, setMessage] = useState("");

  useEffect(() => {
    const prev = prevRef.current;
    const next = new Map<string, string>();
    for (const task of tasks) {
      const name = task.agent_id
        ? getActorName("agent", task.agent_id)
        : t(($) => $.pending_execution.fallback_name);
      next.set(task.id, name);
    }

    const announcements: string[] = [];
    for (const [id, name] of next) {
      if (!prev.has(id)) {
        announcements.push(
          t(($) => $.pending_execution.started_working, { name }),
        );
      }
    }
    for (const [id, name] of prev) {
      if (!next.has(id)) {
        announcements.push(t(($) => $.pending_execution.finished, { name }));
      }
    }

    prevRef.current = next;
    if (announcements.length > 0) setMessage(announcements.join(". "));
  }, [tasks, getActorName, t]);

  return (
    <span aria-live="polite" className="sr-only">
      {message}
    </span>
  );
}
