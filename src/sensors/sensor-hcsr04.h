// Path: src/sensors/sensor-vl53l1x.h
#pragma once

// Function to initialize the sensor
namespace Sensor
{
    namespace HCSR04
    {

#ifndef SENSOR_TYPE_HCSR04_PIN_TRIGGER
#define SENSOR_TYPE_HCSR04_PIN_TRIGGER 5
#endif
#ifndef SENSOR_TYPE_HCSR04_PIN_ECHO
#define SENSOR_TYPE_HCSR04_PIN_ECHO 18
#endif
#ifndef SENSOR_TYPE_HCSR04_DISTANCE_MAX
#define SENSOR_TYPE_HCSR04_DISTANCE_MAX 40
#endif

        void setup();
        float measureDistanceCm();
    } // namespace HCSR04
} // namespace Sensor
