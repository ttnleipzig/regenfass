#pragma once

// HCSR04 sensor
namespace Sensor
{
    namespace DS18B20
    {
        float measureDistanceCm();
        void setup();
        void loop();
    } // namespace DS18B20
} // namespace Sensor
