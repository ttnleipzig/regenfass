#pragma once

// VL53L0X sensor
namespace Sensor
{
    namespace VL53L0X
    {
        /**
         * @brief Do a single-shot measurement and return the distance in centimeters.
         *
         * @return float Distance in centimeters, or NAN when unavailable.
         */
        float measureDistanceCm();

        /**
         * @brief Report whether the sensor was detected and initialized.
         *
         * @return bool
         */
        bool isReady();

        void setup();
        void loop();
    } // namespace VL53L0X
} // namespace Sensor
