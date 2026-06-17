// @vitest-environment jsdom

import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentTask } from "@multica/core/types";
import { renderWithI18n } from "../../test/i18n";

const mockState = vi.hoisted(() => ({
  snapshot: [] as unknown[],
  taskMessagesOptions: vi.fn(),
}));

vi.mock("@multica/core/hooks", () => ({
  useWorkspaceId: () => "ws-1",
}));

vi.mock("@multica/core/workspace/hooks", () => ({
  useActorName: () => ({
    getActorName: (_type: string, id: string) =>
      ({
        "agent-1": "Walt",
        "agent-2": "Gus",
      })[id] ?? "Unknown Agent",
    getActorInitials: (_type: string, id: string) =>
      ({
        "agent-1": "WA",
        "agent-2": "GU",
      })[id] ?? "UA",
    getActorAvatarUrl: () => null,
  }),
}));

vi.mock("@multica/core/chat/queries", () => ({
  taskMessagesOptions: mockState.taskMessagesOptions,
}));

vi.mock("@tanstack/react-query", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-query")>(
      "@tanstack/react-query",
    );

  return {
    ...actual,
    useQuery: (opts: { queryKey?: readonly unknown[] }) => {
      if (opts.queryKey?.[2] === "agent-task-snapshot") {
        return { data: mockState.snapshot };
      }
      return { data: undefined };
    },
  };
});

import { IssueAgentHeaderChip } from "./issue-agent-header-chip";

function makeTask(overrides: Partial<AgentTask>): AgentTask {
  return {
    id: "task-1",
    agent_id: "agent-1",
    runtime_id: "runtime-1",
    issue_id: "issue-1",
    status: "running",
    priority: 0,
    dispatched_at: null,
    started_at: "2026-06-08T08:00:00Z",
    completed_at: null,
    result: null,
    error: null,
    created_at: "2026-06-08T08:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockState.snapshot = [];
});

afterEach(() => {
  document.querySelectorAll("[data-pending-execution]").forEach((el) =>
    el.remove(),
  );
});

describe("IssueAgentHeaderChip", () => {
  it("shows the active agent name without event count or elapsed time", () => {
    mockState.snapshot = [makeTask({})];

    renderWithI18n(<IssueAgentHeaderChip issueId="issue-1" />);

    expect(
      screen.getByRole("button", { name: "Walt is working" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Walt is working")).toBeInTheDocument();
    expect(screen.queryByText(/events?/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+[smh]/i)).not.toBeInTheDocument();
    expect(mockState.taskMessagesOptions).not.toHaveBeenCalled();
  });

  it("is a pointer that scrolls to the inline pending entry, not a second copy of it", () => {
    mockState.snapshot = [makeTask({ id: "task-running" })];

    // The canonical live surface — an inline pending-execution entry — lives in
    // the timeline. The chip points at it; clicking scrolls it into view.
    const entry = document.createElement("div");
    entry.setAttribute("data-pending-execution", "");
    const scrollIntoView = vi.fn();
    entry.scrollIntoView = scrollIntoView;
    document.body.appendChild(entry);

    renderWithI18n(<IssueAgentHeaderChip issueId="issue-1" />);

    // No popover / duplicated rows — the chip is a single button.
    expect(screen.queryByTestId("active-task-row")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Walt is working" }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(mockState.taskMessagesOptions).not.toHaveBeenCalled();
  });

  it("uses the concise multi-agent working label", () => {
    mockState.snapshot = [
      makeTask({ id: "task-1", agent_id: "agent-1" }),
      makeTask({ id: "task-2", agent_id: "agent-2" }),
    ];

    renderWithI18n(<IssueAgentHeaderChip issueId="issue-1" />);

    expect(
      screen.getByRole("button", { name: "2 agents working" }),
    ).toBeInTheDocument();
    // Single rendering — the label only, no duplicated popover header/rows.
    expect(screen.getByText("2 agents working")).toBeInTheDocument();
    expect(screen.queryByTestId("active-task-row")).not.toBeInTheDocument();
    expect(mockState.taskMessagesOptions).not.toHaveBeenCalled();
  });

  it("uses the requested Chinese single-agent copy", () => {
    mockState.snapshot = [makeTask({})];

    renderWithI18n(<IssueAgentHeaderChip issueId="issue-1" />, {
      locale: "zh-Hans",
    });

    expect(screen.getByText("Walt 在工作")).toBeInTheDocument();
  });

  it("does not render for inactive or unrelated tasks", () => {
    mockState.snapshot = [
      makeTask({
        id: "task-done",
        status: "completed",
        completed_at: "2026-06-08T08:05:00Z",
      }),
      makeTask({ id: "task-other", issue_id: "issue-2" }),
    ];

    renderWithI18n(<IssueAgentHeaderChip issueId="issue-1" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
