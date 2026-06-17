// @vitest-environment jsdom

import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgentTask } from "@multica/core/types";
import { renderWithI18n } from "../../test/i18n";

vi.mock("@multica/core/workspace/hooks", () => ({
  useActorName: () => ({
    getActorName: (_type: string, id: string) =>
      ({ "agent-1": "Walt" })[id] ?? "Unknown",
    getActorInitials: () => "WA",
    getActorAvatarUrl: () => null,
  }),
}));

vi.mock("../../common/actor-avatar", () => ({
  ActorAvatar: () => <span data-testid="actor-avatar" />,
}));

// Isolate the card from the transcript dialog stack — assert the trigger's
// accessible name only.
vi.mock("../../common/task-transcript", () => ({
  TranscriptButton: ({ title }: { title?: string }) => (
    <button type="button" aria-label={title}>
      transcript
    </button>
  ),
}));

import { PendingExecutionCard } from "./pending-execution-card";
import { PendingExecutionAnnouncer } from "./pending-execution-announcer";

const START = "2026-06-17T10:00:00Z";
const NOW = Date.parse("2026-06-17T10:05:04Z"); // 5m 04s later

function task(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: "task-1",
    agent_id: "agent-1",
    runtime_id: "rt-1",
    issue_id: "issue-1",
    status: "running",
    priority: 0,
    dispatched_at: null,
    started_at: START,
    completed_at: null,
    result: null,
    error: null,
    created_at: START,
    ...overrides,
  };
}

afterEach(() => cleanup());

describe("PendingExecutionCard", () => {
  it("surfaces identity, a text 'working' state, and live elapsed", () => {
    renderWithI18n(<PendingExecutionCard task={task()} nowMs={NOW} />);

    expect(screen.getByText("Walt")).toBeInTheDocument();
    // State is conveyed by the WORD, not colour/motion alone (WCAG 1.4.1).
    expect(screen.getByText("Working")).toBeInTheDocument();
    expect(screen.getByText("5m 04s")).toBeInTheDocument();
  });

  it("labels a queued run honestly and hides the transcript (nothing to expand yet)", () => {
    renderWithI18n(
      <PendingExecutionCard
        task={task({ status: "queued", started_at: null })}
        nowMs={NOW}
      />,
    );

    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("gives the expand control a specific accessible name", () => {
    renderWithI18n(<PendingExecutionCard task={task()} nowMs={NOW} />);

    expect(
      screen.getByRole("button", { name: "Expand run for Walt" }),
    ).toBeInTheDocument();
  });

  it("keeps the working pulse reduced-motion-safe (animation gated on motion-safe)", () => {
    const { container } = renderWithI18n(
      <PendingExecutionCard task={task()} nowMs={NOW} />,
    );
    // The pulse animation only runs when motion is allowed (WCAG 2.3.3), and
    // the solid dot underneath never fades — so no bare `animate-pulse`.
    expect(
      container.querySelector(".motion-safe\\:animate-ping"),
    ).not.toBeNull();
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
});

describe("PendingExecutionAnnouncer", () => {
  it("announces appearance and resolution on a polite live region (WCAG 4.1.3)", () => {
    const { rerender, container } = renderWithI18n(
      <PendingExecutionAnnouncer tasks={[task()]} />,
    );

    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live).toHaveTextContent("Walt started working");

    rerender(<PendingExecutionAnnouncer tasks={[]} />);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Walt finished",
    );
  });
});
