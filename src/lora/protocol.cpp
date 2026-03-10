#include "./protocol.h"

#include <cstring>

std::vector<uint8_t> Lora::Protocol::packDataPoints(const std::vector<DataPoint> &data_points)
{
    std::vector<uint8_t> packed_data;

    packed_data.reserve(calculate_packed_bytes(data_points));

    for (const auto &dp : data_points)
    {
        uint8_t first = static_cast<uint8_t>(dp.measurement_type) << 4 | static_cast<uint8_t>(dp.channel_id);

        packed_data.push_back(first);

        if (std::holds_alternative<bool>(dp.value))
        {
            bool val = std::get<bool>(dp.value);
            packed_data.push_back(static_cast<uint8_t>(val));
        }
        else if (std::holds_alternative<float>(dp.value))
        {
            float val = std::get<float>(dp.value);
            uint8_t *float_bytes = reinterpret_cast<uint8_t *>(&val);
            packed_data.insert(packed_data.end(), float_bytes, float_bytes + sizeof(float));
        }
    }

    return packed_data;
}

size_t Lora::Protocol::calculate_packed_bytes(const std::vector<DataPoint> &data_points)
{
    size_t size = 0;
    for (const auto &dp : data_points)
    {
        size += 1; // 4 bits for measurement type + 4 bits for channel ID
        size += std::holds_alternative<bool>(dp.value) ? 1 : sizeof(float);
    }

    return size;
}
