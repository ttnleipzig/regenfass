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
            if (DEBUG_LEVEL > 0)
                Serial.println("Setup:\tDS18B20 sensor");
        }
        void loop()
        {
            if (DEBUG_LEVEL > 2)
                Serial.println("Loop:\tDS18B20 sensor");
        }
    } // namespace DS18B20
} // namespace Sensor
