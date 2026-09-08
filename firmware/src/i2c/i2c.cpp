#include <Arduino.h>

#include "i2c.h"

#if FEATURE_I2C_ENABLED
#include <Wire.h>

#if defined(I2C_SDA_PIN) != defined(I2C_SCL_PIN)
#error "Define both I2C_SDA_PIN and I2C_SCL_PIN, or neither"
#endif

#ifndef I2C_CLOCK_HZ
#define I2C_CLOCK_HZ 400000
#endif

namespace
{
    bool bus_ready = false;
    bool bus_started = false;
} // namespace

namespace I2C
{
    void setup()
    {
        if (bus_started)
            return;
        bus_started = true;

#ifdef I2C_SDA_PIN
        log_i("Setup I2C bus (SDA=%d, SCL=%d, %d Hz)", I2C_SDA_PIN, I2C_SCL_PIN, I2C_CLOCK_HZ);
        bus_ready = Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
#else
        log_i("Setup I2C bus (board default pins, %d Hz)", I2C_CLOCK_HZ);
        bus_ready = Wire.begin();
#endif

        if (!bus_ready)
        {
            log_e("Failed to initialize the I2C bus!");
            return;
        }

        Wire.setClock(I2C_CLOCK_HZ);
    }

    bool isReady()
    {
        return bus_ready;
    }
} // namespace I2C

#endif
