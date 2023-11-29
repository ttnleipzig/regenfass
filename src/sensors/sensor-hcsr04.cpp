#include <Arduino.h>

// Library for HCSR04 sensor
#include <HCSR04.h>

namespace Sensor
{
    namespace HCSR04
    {
        // Create the sensor object
        UltraSonicDistanceSensor distanceSensor(SENSOR_PIN_TRIGGER, SENSOR_PIN_ECHO, SENSOR_MAX_DISTANCE);

        /**
         * @brief Do a measurement using the sensor and print the distance in centimeters.
         *
         * @return float
         */
        float measureDistanceCm()
        {
            float distance = distanceSensor.measureDistanceCm();
            return distance;
        }

        /* @deprecated */
        void setup()
        {
            if (DEBUG_LEVEL > 0)
                Serial.println("Setup:\tSensor HCSR04");
        }
        void loop()
        {
            float distance = measureDistanceCm();
            if (DEBUG_LEVEL > 2)
            {
                Serial.print("HCSR04:\t");
                Serial.print(distance);
                Serial.println(" cm");
            }
        }
    }
} // namespace Sensor
