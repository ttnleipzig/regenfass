#pragma once

#include <cstdint>
#include <vector>
#include <variant>

namespace Lora::Protocol
{
    enum class MeasurementType : uint8_t
    {
        Boolean = 0b0000,
        Float = 0b0001,
        Pressure = 0b0010,
        Voltage = 0b0011,
        Distance = 0b0100,
        Temperature = 0b0101,
        PPx = 0b0110,
        Brightness = 0b0111,
        Resistance = 0b1000,
        Humidity = 0b1001,
        pH = 0b1010,
        SoundLevel = 0b1011,
        // For later use
        Unused1 = 0b1100,
        Unused2 = 0b1101,
        Unused3 = 0b1111
    };

    enum class ChannelID : uint8_t
    {
        _0 = 0,
        _1 = 1,
        _2 = 2,
        _3 = 3,
        _4 = 4,
        _5 = 5,
        _6 = 6,
        _7 = 7,
        _8 = 8,
        _9 = 9,
        _10 = 10,
        _11 = 11,
        _12 = 12,
        _13 = 13,
        _14 = 14,
        _15 = 15
    };

    union ValueType
    {
        bool bool_;
        float float_;
    };

    struct DataPoint
    {
        MeasurementType measurement_type;
        ChannelID channel_id;
        std::variant<bool, float> value;
    };

    // Function to pack a vector of DataPoint structs into a single std::vector<uint8_t>
    std::vector<uint8_t> packDataPoints(const std::vector<DataPoint> &data_points);

    size_t calculate_packed_bytes(const std::vector<DataPoint> &data_points);
}
