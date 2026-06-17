package metrics

import (
	"testing"

	"github.com/prometheus/client_golang/prometheus/testutil"
)

func TestRecordDuplicateTrigger(t *testing.T) {
	m := NewBusinessMetrics()

	m.RecordDuplicateTrigger(DuplicateTriggerSuppressed)
	m.RecordDuplicateTrigger(DuplicateTriggerSuppressed)
	m.RecordDuplicateTrigger(DuplicateTriggerRunningWindow)

	if got := testutil.ToFloat64(m.duplicateTrigger.WithLabelValues("suppressed")); got != 2 {
		t.Fatalf("suppressed counter = %v, want 2", got)
	}
	if got := testutil.ToFloat64(m.duplicateTrigger.WithLabelValues("running_window")); got != 1 {
		t.Fatalf("running_window counter = %v, want 1", got)
	}
	// Low cardinality: exactly the two signals we recorded, no per-issue/agent
	// series leaking in.
	if got := testutil.CollectAndCount(m.duplicateTrigger); got != 2 {
		t.Fatalf("duplicate_trigger series count = %d, want 2", got)
	}
}

func TestRecordDuplicateTriggerNilSafe(t *testing.T) {
	var m *BusinessMetrics
	// Must not panic — PostHog-only / test handlers carry a nil collector.
	m.RecordDuplicateTrigger(DuplicateTriggerSuppressed)
}
