#pragma once

/*
#include <Wire.h>
#include <VL53L1X.h>
VL53L1X sensor;

#elif SENSOR_DS18B20
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire oneWire(SENSOR_DATA_PIN);

// Pass our oneWire reference to Dallas Temperature.
DallasTemperature sensors(&oneWire);
*/

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
