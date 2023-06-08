#include <Arduino.h>

#ifdef SENSOR_TYPE_HCSR04
#include <HCSR04.h>

#define DISTANCE_MAX 400

UltraSonicDistanceSensor distanceSensor(SENSOR_TYPE_HCSR04_PIN_TRIGGER, SENSOR_TYPE_HCSR04_PIN_ECHO, DISTANCE_MAX);

#elif SENSOR_TYPE_VL53L1X
#include <Wire.h>
#include <VL53L1X.h>
VL53L1X sensor;

#elif SENSOR_TYPE_DS18B20
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire oneWire(SENSOR_TYPE_DS18B20_DATA_PIN);

// Pass our oneWire reference to Dallas Temperature.
DallasTemperature sensors(&oneWire);

#else
#warning "Sensor type not selected. Add SENSOR_TYPE_HCSR04 or SENSOR_TYPE_VL53L1X in your environment build_plags in platformio.ini"
#endif

float distance = -1;

void setup()
{

#ifdef WAIT_SERIAL
    while (!Serial)
    {
    }
#endif

    Serial.begin(115200); // We initialize serial connection so that we could print values from sensor.
    Serial.println("Starting...");

#ifdef SENSOR_TYPE_VL53L1X
    Wire.begin();
    Wire.setClock(400000); // use 400 kHz I2C

    sensor.setTimeout(500);
    if (!sensor.init())
    {
        Serial.println("Failed to detect and initialize VL53L1X sensor!");
        while (1)
            ;
    }
    sensor.setDistanceMode(VL53L1X::Long);
    sensor.setMeasurementTimingBudget(50000);
    sensor.startContinuous(50);
#endif

#ifdef SENSOR_TYPE_DS18B20
    sensors.begin();
#endif

    Serial.println("Started");
}

void loop()
{

// Every 500 miliseconds, do a measurement using the sensor and print the distance in centimeters.
#ifdef SENSOR_TYPE_HCSR04
    distance = distanceSensor.measureDistanceCm();

    Serial.printf("Distance: %f cm\n", distance);
#elif SENSOR_TYPE_VL53L1X
    sensor.read();
    distance = sensor.ranging_data.range_mm / 10.0;

    Serial.printf("Distance: %f cm\n", distance);
#elif SENSOR_TYPE_DS18B20
  sensors.requestTemperatures(); 
  float temperatureC = sensors.getTempCByIndex(0);
  float temperatureF = sensors.getTempFByIndex(0);
  Serial.print(temperatureC);
  Serial.println("ºC");
  Serial.print(temperatureF);
  Serial.println("ºF");
#endif

    delay(500);
}
