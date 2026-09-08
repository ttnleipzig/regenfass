#pragma once

#if FEATURE_SENSOR_VL53L0X || FEATURE_SENSOR_VL53L1X
#define FEATURE_I2C_ENABLED true
#else
#define FEATURE_I2C_ENABLED false
#endif

#if FEATURE_I2C_ENABLED
namespace I2C
{
    /**
     * @brief Initialize the I2C bus. Safe to call more than once.
     */
    void setup();

    /**
     * @brief Report whether the bus came up successfully.
     *
     * @return bool
     */
    bool isReady();
} // namespace I2C
#endif
