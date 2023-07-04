// Path: src/sensors/sensor-vl53l1x.h
#pragma once

// Function to initialize the sensor
namespace Sensor
{
    namespace HCSR04
    {

#ifndef SENSOR_PIN_TRIGGER
#define SENSOR_PIN_TRIGGER 5
#endif
#ifndef SENSOR_PIN_ECHO
#define SENSOR_PIN_ECHO 18
#endif
#ifndef SENSOR_MAX_DISTANCE
#define SENSOR_MAX_DISTANCE 40
#endif

        void setup();
        float measureDistanceCm();
    } // namespace HCSR04
} // namespace Sensor
