package loraprotocol

import (
	"encoding/binary"
	"errors"
	"math"
)

var ErrInvalidData = errors.New("invalid data")

type MeasurementType uint8

const (
	Boolean     MeasurementType = 0b0000
	Float       MeasurementType = 0b0001
	Pressure    MeasurementType = 0b0010
	Voltage     MeasurementType = 0b0011
	Distance    MeasurementType = 0b0100
	Temperature MeasurementType = 0b0101
	PPx         MeasurementType = 0b0110
	Brightness  MeasurementType = 0b0111
	Resistance  MeasurementType = 0b1000
	Humidity    MeasurementType = 0b1001
	PH          MeasurementType = 0b1010
	SoundLevel  MeasurementType = 0b1011
)

type DataPoint struct {
	Type      MeasurementType
	ChannelID uint8
	Value     any
}

func Decode(data []byte) ([]DataPoint, error) {
	var datapoints []DataPoint
	for len(data) > 0 {
		dp, leftOver, err := DecodeOne(data)
		if err != nil {
			return nil, err
		}

		datapoints = append(datapoints, dp)
		data = leftOver
	}

	return datapoints, nil
}

func DecodeOne(data []byte) (DataPoint, []byte, error) {
	if len(data) < 1 {
		return DataPoint{}, data, ErrInvalidData
	}

	type_, channelID := MeasurementType(data[0]&0x0F), uint8(data[0]>>4)
	value, leftOver, err := decodeValue(type_, data[1:])
	if err != nil {
		return DataPoint{}, leftOver, err
	}

	return DataPoint{
		Type:      type_,
		ChannelID: channelID,
		Value:     value,
	}, leftOver, nil
}

func decodeValue(type_ MeasurementType, data []byte) (interface{}, []byte, error) {
	switch type_ {
	case Boolean:
		if len(data) < 1 {
			return nil, data, ErrInvalidData
		}
		return data[0] != 0, data[1:], nil
	case Float:
		fallthrough
	case Pressure:
		fallthrough
	case Voltage:
		fallthrough
	case Distance:
		fallthrough
	case Temperature:
		fallthrough
	case PPx:
		fallthrough
	case Brightness:
		fallthrough
	case Resistance:
		fallthrough
	case Humidity:
		fallthrough
	case PH:
		fallthrough
	case SoundLevel:
		if len(data) < 4 {
			return nil, nil, ErrInvalidData
		}
		value := readFloat32(data[:4])
		return value, data[4:], nil

	default:
		return data, nil, ErrInvalidData
	}
}

func readFloat32(bytes []byte) float32 {
	bits := binary.LittleEndian.Uint32(bytes)
	return math.Float32frombits(bits)
}
