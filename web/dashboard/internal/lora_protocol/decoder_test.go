package loraprotocol

import "testing"

func TestMeasurementTypeValid(t *testing.T) {
	// Every type the protocol defines must be accepted: these are the values a
	// client can legitimately declare for a channel.
	for _, type_ := range []MeasurementType{
		Boolean, Float, Pressure, Voltage, Distance, Temperature,
		PPx, Brightness, Resistance, Humidity, PH, SoundLevel,
	} {
		if !type_.Valid() {
			t.Errorf("MeasurementType(%d).Valid() = false, want true", type_)
		}
	}

	// Everything above the highest defined type is unknown. Decoding rejects
	// these too, so accepting one when a client declares it would let a channel
	// be labelled with a type no reading can ever have.
	for type_ := int(SoundLevel) + 1; type_ <= 0xFF; type_++ {
		if MeasurementType(type_).Valid() {
			t.Errorf("MeasurementType(%d).Valid() = true, want false", type_)
		}
	}
}

func TestMaxChannelIDMatchesDecodedChannels(t *testing.T) {
	// A data point encodes its channel in the high nibble of its first byte, so
	// MaxChannelID has to be exactly what that nibble can express — otherwise
	// the API would reject a channel a device can actually report on.
	for header := 0; header <= 0xFF; header++ {
		// Boolean is the one-byte-payload type, so this always decodes.
		data := []byte{byte(header&0xF0) | byte(Boolean), 1}
		dp, _, err := DecodeOne(data)
		if err != nil {
			t.Fatalf("DecodeOne(%#v) returned %v", data, err)
		}
		if int(dp.ChannelID) > MaxChannelID {
			t.Fatalf("decoded channel %d exceeds MaxChannelID %d", dp.ChannelID, MaxChannelID)
		}
	}

	// And the bound is tight: the top channel is reachable.
	dp, _, err := DecodeOne([]byte{0xF0 | byte(Boolean), 1})
	if err != nil {
		t.Fatalf("DecodeOne returned %v", err)
	}
	if int(dp.ChannelID) != MaxChannelID {
		t.Fatalf("top channel decoded as %d, want MaxChannelID %d", dp.ChannelID, MaxChannelID)
	}
}
