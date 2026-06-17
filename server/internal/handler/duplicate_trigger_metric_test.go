package handler

import (
	"context"
	"testing"

	"github.com/prometheus/client_golang/prometheus"

	obsmetrics "github.com/multica-ai/multica/server/internal/metrics"
)

// withDuplicateTriggerMetrics swaps a fresh BusinessMetrics onto the shared test
// handler (TestMain leaves Metrics nil) and registers it in a local registry so
// the test can read the duplicate-trigger counter. Restores the original on
// cleanup. Tests in this package run serially (no t.Parallel), so the swap is safe.
func withDuplicateTriggerMetrics(t *testing.T) *prometheus.Registry {
	t.Helper()
	reg := prometheus.NewRegistry()
	m := obsmetrics.NewBusinessMetrics()
	reg.MustRegister(m.Collectors()...)
	old := testHandler.Metrics
	testHandler.Metrics = m
	t.Cleanup(func() { testHandler.Metrics = old })
	return reg
}

// dupTriggerCount reads multica_agent_duplicate_trigger_total{signal=...} from
// the registry. Gathering keeps the assertion outside the metrics package's
// unexported fields.
func dupTriggerCount(t *testing.T, reg *prometheus.Registry, signal string) float64 {
	t.Helper()
	mfs, err := reg.Gather()
	if err != nil {
		t.Fatalf("gather metrics: %v", err)
	}
	for _, mf := range mfs {
		if mf.GetName() != "multica_agent_duplicate_trigger_total" {
			continue
		}
		for _, metric := range mf.GetMetric() {
			for _, l := range metric.GetLabel() {
				if l.GetName() == "signal" && l.GetValue() == signal {
					return metric.GetCounter().GetValue()
				}
			}
		}
	}
	return 0
}

// TestDuplicateTrigger_SuppressedRemention covers MUL-4 signal (a): a re-mention
// that is deduped against an existing queued/dispatched task increments the
// suppressed counter (and, as before, enqueues nothing new).
func TestDuplicateTrigger_SuppressedRemention(t *testing.T) {
	if testHandler == nil || testPool == nil {
		t.Skip("database not available")
	}
	ctx := context.Background()
	reg := withDuplicateTriggerMetrics(t)
	fx := newSelfMentionFixture(t)

	// Seed a queued task → the re-mention below must be deduped.
	if _, err := testPool.Exec(ctx, `
		INSERT INTO agent_task_queue (agent_id, runtime_id, issue_id, status)
		VALUES ($1, $2, $3, 'queued')
	`, fx.JID, fx.RuntimeID, fx.IssueAID); err != nil {
		t.Fatalf("seed queued task: %v", err)
	}

	triggers := testHandler.computeMentionedAgentCommentTriggers(
		ctx, fx.IssueA, fx.CommentA.Content, nil, "agent", fx.JID,
		commentTriggerComputeOptions{RecordMetrics: true},
	)
	if len(triggers) != 0 {
		t.Fatalf("expected the re-mention to be deduped (0 triggers), got %d", len(triggers))
	}
	if got := dupTriggerCount(t, reg, "suppressed"); got != 1 {
		t.Fatalf("suppressed counter = %v, want 1", got)
	}
}

// TestDuplicateTrigger_SuppressedRemention_NotCountedOnPreview proves the metric
// is gated to the real creation path: the live preview (RecordMetrics:false)
// recomputes on every keystroke and must NOT inflate the counter.
func TestDuplicateTrigger_SuppressedRemention_NotCountedOnPreview(t *testing.T) {
	if testHandler == nil || testPool == nil {
		t.Skip("database not available")
	}
	ctx := context.Background()
	reg := withDuplicateTriggerMetrics(t)
	fx := newSelfMentionFixture(t)

	if _, err := testPool.Exec(ctx, `
		INSERT INTO agent_task_queue (agent_id, runtime_id, issue_id, status)
		VALUES ($1, $2, $3, 'queued')
	`, fx.JID, fx.RuntimeID, fx.IssueAID); err != nil {
		t.Fatalf("seed queued task: %v", err)
	}

	// Preview path: RecordMetrics defaults to false.
	testHandler.computeMentionedAgentCommentTriggers(
		ctx, fx.IssueA, fx.CommentA.Content, nil, "agent", fx.JID,
		commentTriggerComputeOptions{},
	)
	if got := dupTriggerCount(t, reg, "suppressed"); got != 0 {
		t.Fatalf("preview must not count: suppressed counter = %v, want 0", got)
	}
}

// TestDuplicateTrigger_RunningWindow covers MUL-4 signal (b): a re-mention while
// the agent is already running slips past the queued/dispatched dedup, so the
// enqueue path records a running-window duplicate — and (Option A) still
// enqueues the follow-up, i.e. no behavior change.
func TestDuplicateTrigger_RunningWindow(t *testing.T) {
	if testHandler == nil || testPool == nil {
		t.Skip("database not available")
	}
	ctx := context.Background()
	reg := withDuplicateTriggerMetrics(t)
	fx := newSelfMentionFixture(t)

	// Seed a running task — invisible to the queued/dispatched dedup.
	if _, err := testPool.Exec(ctx, `
		INSERT INTO agent_task_queue (agent_id, runtime_id, issue_id, status)
		VALUES ($1, $2, $3, 'running')
	`, fx.JID, fx.RuntimeID, fx.IssueAID); err != nil {
		t.Fatalf("seed running task: %v", err)
	}

	triggers := testHandler.computeMentionedAgentCommentTriggers(
		ctx, fx.IssueA, fx.CommentA.Content, nil, "agent", fx.JID,
		commentTriggerComputeOptions{RecordMetrics: true},
	)
	if len(triggers) != 1 {
		t.Fatalf("running task must not dedup the mention: got %d triggers, want 1", len(triggers))
	}

	before := countQueuedOrDispatched(t, fx.JID, fx.IssueAID)
	testHandler.enqueueCommentAgentTriggers(ctx, fx.IssueA, fx.CommentA.ID, triggers)
	after := countQueuedOrDispatched(t, fx.JID, fx.IssueAID)

	if got := dupTriggerCount(t, reg, "running_window"); got != 1 {
		t.Fatalf("running_window counter = %v, want 1", got)
	}
	// Option A — instrumentation only: the follow-up is still enqueued.
	if after != before+1 {
		t.Fatalf("expected the follow-up to still enqueue (count %d→%d), no behavior change", before, after)
	}
	if got := dupTriggerCount(t, reg, "suppressed"); got != 0 {
		t.Fatalf("suppressed counter = %v, want 0 (this is a running-window case)", got)
	}
}
