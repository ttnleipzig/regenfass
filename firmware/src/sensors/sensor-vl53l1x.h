#pragma once

// Sensor VL53L1X
namespace Sensor
{
    namespace VL53L1X
    {
        /**
         * @brief Do a measurement using the sensor and print the distance in centimeters.
         *
         * @return float
         */
        float
        measureDistanceCm();
        void setup();
        void loop();
    } // namespace VL53L1X
} // namespace Sensor
