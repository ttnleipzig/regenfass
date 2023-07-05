#include <Arduino.h>

// Function to initialize the sensor
namespace Sensor
{
    namespace DS18B20
    {
        /**
         * @brief Do a measurement using the sensor and print the distance in centimeters.
         *
         * @return float
         */
        float measureDistanceCm()
        {
            return 5.0;
        }

        void setup()
        {
            Serial.println("Setup: DS18B20 sensor");
        }
        void loop()
        {
            Serial.println("Loop: DS18B20 sensor");
        }
    } // namespace DS18B20
} // namespace Sensor
