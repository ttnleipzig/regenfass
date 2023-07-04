// Library for HCSR04 sensor
#include <HCSR04.h>

// Create the sensor object
UltraSonicDistanceSensor distanceSensor(SENSOR_PIN_TRIGGER, SENSOR_PIN_ECHO, SENSOR_MAX_DISTANCE);

// Function to initialize the sensor
namespace Sensor
{
    namespace HCSR04
    {

        void setup()
        {
            Serial.println("Starting HCSR04 sensor");
        }

        /**
         * @brief Do a measurement using the sensor and print the distance in centimeters.
         *
         * @return float
         */
        float measureDistanceCm()
        {
            return distanceSensor.measureDistanceCm();
        }
    } // namespace HCSR04
} // namespace Sensor
