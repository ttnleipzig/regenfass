package api

import (
	"math"
	"testing"
)

func TestMeasurementValue(t *testing.T) {
	tests := []struct {
		name  string
		value any
		want  float64
	}{
		// Booleans are flattened so every measurement has one shape. The row's
		// measurement_type still says the value arrived as a Boolean, so 0 is
		// unambiguously false — nothing about the reading's meaning is lost.
		{name: "true is one", value: true, want: 1},
		{name: "false is zero", value: false, want: 0},
		// float32 widens exactly, so a seeded value and an ingested one of the
		// same reading compare equal.
		{name: "float32 widens exactly", value: float32(4.0877), want: float64(float32(4.0877))},
		{name: "negative float32", value: float32(-1), want: -1},
		{name: "float64 passes through", value: float64(1013.25), want: 1013.25},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := measurementValue(tt.value)
			if err != nil {
				t.Fatalf("measurementValue(%v) returned %v", tt.value, err)
			}
			if got != tt.want {
				t.Fatalf("measurementValue(%v) = %v, want %v", tt.value, got, tt.want)
			}
		})
	}
}

func TestMeasurementValueRejectsUnknownShapes(t *testing.T) {
	// The decoder produces only bool and float32. Anything else means it grew a
	// shape this has not been taught about, which must not be stored as a
	// silent zero.
	for _, value := range []any{"4.0877", nil, []byte{1}, int(1)} {
		if _, err := measurementValue(value); err == nil {
			t.Errorf("measurementValue(%#v) = nil error, want one", value)
		}
	}
}

func TestMeasurementValueBooleanRoundTrip(t *testing.T) {
	// The stored number has to read back as the same boolean, using the "not
	// zero" rule the frontend applies.
	for _, want := range []bool{true, false} {
		stored, err := measurementValue(want)
		if err != nil {
			t.Fatalf("measurementValue(%v) returned %v", want, err)
		}
		if got := stored != 0; got != want {
			t.Fatalf("round trip of %v gave %v (stored %v)", want, got, stored)
		}
		if math.Mod(stored, 1) != 0 {
			t.Fatalf("boolean stored as non-integral %v", stored)
		}
	}
}
