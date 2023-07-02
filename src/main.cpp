// Libraries
#include <Arduino.h>

// Sensors
#ifdef SENSOR_TYPE_HCSR04
#include "sensors/sensor-hcsr04.h"
#elif SENSOR_TYPE_VL53L1X
#include "sensors/sensor-vl53l1x.h"
#else
#warning "Sensor type not selected. Add SENSOR_TYPE_HCSR04 or SENSOR_TYPE_VL53L1X in your environment build_plags in platformio.ini"
#endif

// Main variables
float distance = -1;

/*
unsigned long last_print_time = 0;


void setup () {

  #ifdef WAIT_SERIAL
  while (!Serial) {}
  #endif

  Serial.begin(115200);  // We initialize serial connection so that we could print values from sensor.
  Serial.println("Starting...");

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

  #ifdef LORE_ENABLED
    loraSetup();
  #endif

  Serial.println("Started");


#ifdef SENSOR_TYPE_DS18B20
    sensors.begin();
*/

// Main functions
void setup()
{
#ifdef WAIT_SERIAL
    while (!Serial)
    {
    }
#endif
    Serial.begin(115200);
    Serial.println("Starting ...");

// Initialize the sensor
#ifdef SENSOR_TYPE_HCSR04
    Sensor::HCSR04::setup();
#elif SENSOR_TYPE_VL53L1X
    Sensor:: ::setup();
#endif
    Serial.println("Started");
}

void loop()
{
/*
distance = distanceSensor.measureDistanceCm();

    Serial.printf("Distance: %f cm\n", distance);
#elif SENSOR_TYPE_VL53L1X
    sensor.read();
    distance = sensor.ranging_data.range_mm / 10.0;

  #ifdef LORE_ENABLED
    if(distance <= 10){
      publish2TTN();
    }
    loraLoop();
  #endif

  // Print to serial every 500 miliseconds
  unsigned long current_time = millis();
  if (current_time - last_print_time >= 500) {
    last_print_time = current_time;
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

*/

// Read the distance
#ifdef SENSOR_TYPE_HCSR04
    distance = Sensor::HCSR04::measureDistanceCm();
#elif SENSOR_TYPE_VL53L1X
    distance = Sensor::VL53L1X::measureDistanceCm();
#endif

    // Print the distance
  // Print to serial every 500 miliseconds
  unsigned long current_time = millis();
  if (current_time - last_print_time >= 500) {
    last_print_time = current_time;
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
