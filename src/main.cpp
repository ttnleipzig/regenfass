// Libraries
#include <Arduino.h>
#include <esp32-hal-log.h>

// Sensors
#if SENSOR_HCSR04
#include "sensors/sensor-hcsr04.h"
#elif SENSOR_VL53L1X
#include "sensors/sensor-vl53l1x.h"
#elif SENSOR_DS18B20
#include "sensors/sensor-ds18b20.h"
#else
#error "Sensor type not selected. Add SENSOR_HCSR04, SENSOR_DS18B20 or SENSOR_VL53L1X in your environment build_flags in platformio.ini"
#endif

// Button
#ifdef BUTTON_PIN
#include "button/button.h"
#endif

// Display SD1306
#ifdef DISPLAY_SD1306
#include "displays/display-sd1306.h"
#endif

// Main functions
void setup()
{
    Serial.begin(115200);
#ifdef WAIT_SERIAL
    while (!Serial)
    {
    }
#endif
    Serial.println("\033[32m\n\n*********************************************************");
    Serial.println("🌈\tStarting regenfass");
    Serial.println("*********************************************************\033[0m\n");

    // Debugging
    if (CORE_DEBUG_LEVEL > 1)
        log_w("Debug:\tenabled");
    else
        log_i("Debug:\tdisabled");

// Sensors
#if SENSOR_HCSR04
    Sensor::HCSR04::setup();
#elif SENSOR_VL53L1X
    Sensor::VL53L1X::setup();
#endif

// Button
#ifdef BUTTON_PIN
    Button::setup();
#endif

// Display SD1306
#ifdef DISPLAY_SD1306
    Display::SD1306::setup();
#endif
}

void loop()
{
// Sensor
#if SENSOR_HCSR04
    Sensor::HCSR04::loop();
#elif SENSOR_VL53L1X
    Sensor::VL53L1X::loop();
#endif

// Button
#ifdef BUTTON_PIN
    Button::loop();
#endif

// Display SD1306
#ifdef DISPLAY_SD1306
    Display::SD1306::loop();
#endif
}

/*
TAKEN FROM LOOP:

distance = distanceSensor.measureDistanceCm();

    Serial.printf("Distance: %f cm\n", distance);
#elif SENSOR_VL53L1X
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
#elif SENSOR_DS18B20
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);
  float temperatureF = sensors.getTempFByIndex(0);
  Serial.print(temperatureC);
  Serial.println("ºC");
  Serial.print(temperatureF);
  Serial.println("ºF");
#endif

// Read the distance
#if SENSOR_HCSR04
    distance = Sensor::HCSR04::measureDistanceCm();
#elif SENSOR_VL53L1X
    distance = Sensor::VL53L1X::measureDistanceCm();
#endif

    // Print the distance
  // Print to serial every 500 miliseconds
  unsigned long current_time = millis();
  if (current_time - last_print_time >= 500) {
    last_print_time = current_time;
    Serial.printf("Distance: %f cm\n", distance);
#elif SENSOR_DS18B20
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);
  float temperatureF = sensors.getTempFByIndex(0);
  Serial.print(temperatureC);
  Serial.println("ºC");
  Serial.print(temperatureF);
  Serial.println("ºF");
#endif
*/

/*
// Global variables
float distance = -1;

unsigned long last_print_time = 0;


void setup () {

  #ifdef WAIT_SERIAL
  while (!Serial) {}
  #endif

  Serial.begin(115200);  // We initialize serial connection so that we could print values from sensor.
  Serial.println("Starting...");

    Serial.begin(115200); // We initialize serial connection so that we could print values from sensor.
    Serial.println("Starting...");

#ifdef SENSOR_VL53L1X
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


#ifdef SENSOR_DS18B20
    sensors.begin();
*/
