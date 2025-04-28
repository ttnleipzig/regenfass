#include "sensor-hx710b.h"
#include <HX710AB.h>
#include <Arduino.h>

static HX710B inner(0, 0);

namespace Sensor::HX710B
{
    void setup(uint8_t sck_pin, uint8_t sdi_pin)
    {
        inner = ::HX710B(sdi_pin, sck_pin);

        inner.begin();

        // FIXME: Calibrate correctly
        inner.calibrate(50, 0, 100, 80);
    }

    int32_t readPressure()
    {
        return inner.read(1);
    }
}
