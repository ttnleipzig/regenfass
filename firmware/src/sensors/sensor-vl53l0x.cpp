#include <Arduino.h>

#if FEATURE_SENSOR_VL53L0X
#include <math.h>
#include <VL53L0X.h>

#include "sensor-vl53l0x.h"
#include "../i2c/i2c.h"

#ifndef SENSOR_VL53L0X_LONG_RANGE
#define SENSOR_VL53L0X_LONG_RANGE true
#endif

#ifndef SENSOR_VL53L0X_TIMING_BUDGET_US
#define SENSOR_VL53L0X_TIMING_BUDGET_US 50000
#endif

#ifndef SENSOR_VL53L0X_TIMEOUT_MS
#define SENSOR_VL53L0X_TIMEOUT_MS 500
#endif

namespace
{
    // At global scope: inside `Sensor::VL53L0X` the namespace name would
    // shadow the driver class of the same name.
    ::VL53L0X device;
    bool device_ready = false;
} // namespace

namespace Sensor::VL53L0X
{
    /**
     * @brief Do a single-shot measurement and return the distance in centimeters.
     *
     * @return float
     */
    float measureDistanceCm()
    {
        if (!device_ready)
            return NAN;

        const uint16_t range_mm = device.readRangeSingleMillimeters();
        if (device.timeoutOccurred())
        {
            log_w("VL53L0X measurement timed out");
            return NAN;
        }

        // 8190 mm and above is what the driver reports out of range.
        if (range_mm >= 8190)
        {
            log_w("VL53L0X out of range");
            return NAN;
        }

        return range_mm / 10.0f;
    }

    bool isReady()
    {
        return device_ready;
    }

    void setup()
    {
        log_i("Setup sensor VL53L0X");

#ifdef SENSOR_VL53L0X_XSHUT_PIN
        pinMode(SENSOR_VL53L0X_XSHUT_PIN, OUTPUT);
        digitalWrite(SENSOR_VL53L0X_XSHUT_PIN, HIGH);
        delay(10);
#endif

        ::I2C::setup();
        if (!::I2C::isReady())
        {
            log_e("VL53L0X needs the I2C bus, which failed to initialize");
            device_ready = false;
            return;
        }

        device.setTimeout(SENSOR_VL53L0X_TIMEOUT_MS);
        if (!device.init())
        {
            log_e("Failed to detect and initialize VL53L0X sensor!");
            device_ready = false;
            return;
        }

#if SENSOR_VL53L0X_LONG_RANGE
        device.setSignalRateLimit(0.1);
        device.setVcselPulsePeriod(::VL53L0X::VcselPeriodPreRange, 18);
        device.setVcselPulsePeriod(::VL53L0X::VcselPeriodFinalRange, 14);
#endif

        device.setMeasurementTimingBudget(SENSOR_VL53L0X_TIMING_BUDGET_US);

        device_ready = true;
    }

    void loop()
    {
    }
} // namespace Sensor::VL53L0X

#endif
