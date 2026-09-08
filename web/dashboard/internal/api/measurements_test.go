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

// TestMergeChannels covers how a device's channel list is assembled: described
// channels come from the mapping table, channels that merely reported are added
// from their data, and a channel that is both is listed once with its
// description intact.
func TestMergeChannels(t *testing.T) {
	name := "Cistern"
	declared := int16(4)
	described := []DeviceChannel{
		{ChannelID: 5, Name: &name, MeasurementType: &declared},
		{ChannelID: 9, Hidden: true},
	}
	reported := map[int16]int16{2: 5, 5: 1}

	got := mergeChannels(described, reported)

	ids := make([]int16, len(got))
	for i, ch := range got {
		ids[i] = ch.ChannelID
	}
	if want := []int16{2, 5, 9}; !equalInt16s(ids, want) {
		t.Fatalf("channel ids = %v, want %v", ids, want)
	}
	if got[0].Name != nil || got[0].MeasurementType != nil || got[0].Hidden {
		t.Errorf("channel 2 should be undescribed, got %+v", got[0])
	}
	if got[0].ReportedType == nil || *got[0].ReportedType != 5 {
		t.Errorf("channel 2 should carry the type it reported, got %+v", got[0])
	}
	if got[1].Name == nil || *got[1].Name != name || got[1].MeasurementType == nil || *got[1].MeasurementType != declared {
		t.Errorf("channel 5 lost its description: %+v", got[1])
	}
	if got[1].ReportedType == nil || *got[1].ReportedType != 1 {
		// Declared and reported types are independent: the user said Distance,
		// the payload carried a Float, and the response says both.
		t.Errorf("channel 5 should carry its reported type alongside the declared one, got %+v", got[1])
	}
	if !got[2].Hidden || got[2].ReportedType != nil {
		t.Errorf("channel 9 should stay hidden with no reported type: %+v", got[2])
	}
}

func TestMergeChannelsEmpty(t *testing.T) {
	if got := mergeChannels(nil, nil); len(got) != 0 {
		t.Fatalf("expected no channels, got %v", got)
	}
}

func equalInt16s(a, b []int16) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
