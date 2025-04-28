#pragma once

#include <cinttypes>

namespace Sensor::HX710B
{
    void setup(uint8_t sck_pin, uint8_t sdi_pin);
    int32_t readPressure(void);
}
