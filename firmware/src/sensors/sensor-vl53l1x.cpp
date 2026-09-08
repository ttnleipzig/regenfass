#include <Arduino.h>

// Library for the sensor VL53L3X

#if FEATURE_SENSOR_VL53L1X
#include <VL53L1X.h>

#include "../i2c/i2c.h"


// Create the sensor object
VL53L1X sensor;

// Function to initialize the sensor VL53L1X
namespace Sensor
{
    namespace VL53L1X
    {
        /**
         * @brief Do a measurement using the sensor and print the distance in centimeters.
         *
         * @return float
         */
        float measureDistanceCm()
        {
            sensor.read();
            return sensor.ranging_data.range_mm / 10.0;
        }

        void setup()
        {
            log_i("Setup sensor VL53L1X");

            ::I2C::setup();

            sensor.setTimeout(500);
            if (!sensor.init())
            {
                log_e("Failed to detect and initialize VL53L1X sensor!");
                while (1)
                    ;
            }
            // sensor.setDistanceMode(VL53L1X::Long);
            sensor.setMeasurementTimingBudget(50000);
            sensor.startContinuous(50);
        }

        void loop()
        {
        }

    } // namespace VL53L1X
} // namespace Sensor

#endif
