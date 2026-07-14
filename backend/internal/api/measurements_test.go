package api

import (
	"testing"
	"time"
)

func TestRangedBucketSeconds(t *testing.T) {
	const day = 24 * time.Hour

	tests := []struct {
		name string
		span time.Duration
		want float64
	}{
		{
			// Very short span: at the target point count the bucket would be
			// sub-minute, so it is clamped to the finest allowed resolution
			// (one point per minute).
			name: "short span clamps to one per minute",
			span: 30 * time.Minute,
			want: minRangedBucketSeconds,
		},
		{
			// Exactly at the threshold where target sampling meets the floor:
			// 2000 points * 60s = ~33.3h.
			name: "at finest-resolution threshold",
			span: targetRangedDataPoints * minRangedBucketSeconds * time.Second,
			want: minRangedBucketSeconds,
		},
		{
			// Mid-range span: bucket is span/target and sits between the bounds.
			name: "week span scales to target point count",
			span: 7 * day,
			want: (7 * day).Seconds() / targetRangedDataPoints,
		},
		{
			// Very long span: at the target point count the bucket would exceed
			// 8h, so it is clamped to the coarsest allowed resolution (three
			// points per day).
			name: "long span clamps to three per day",
			span: 5 * 365 * day,
			want: maxRangedBucketSeconds,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := rangedBucketSeconds(tt.span)
			if got != tt.want {
				t.Fatalf("rangedBucketSeconds(%s) = %v, want %v", tt.span, got, tt.want)
			}
		})
	}
}

// TestRangedBucketSecondsBounds asserts the resolution guarantees hold across a
// wide sweep of spans: never finer than one point per minute, never coarser than
// three points per day.
func TestRangedBucketSecondsBounds(t *testing.T) {
	for span := time.Minute; span < 4000*24*time.Hour; span += 6 * time.Hour {
		got := rangedBucketSeconds(span)
		if got < minRangedBucketSeconds {
			t.Fatalf("span %s produced bucket %v below floor %d", span, got, minRangedBucketSeconds)
		}
		if got > maxRangedBucketSeconds {
			t.Fatalf("span %s produced bucket %v above ceiling %d", span, got, maxRangedBucketSeconds)
		}
		// Coarsest resolution must still yield at least three points per day.
		pointsPerDay := (24 * time.Hour).Seconds() / got
		if pointsPerDay < 3 {
			t.Fatalf("span %s yields %.2f points/day, want >= 3", span, pointsPerDay)
		}
	}
}
