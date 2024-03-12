// Libraries
#include <Arduino.h>
#include <esp32-hal-log.h>

// Sensors
#if FEATURE_SENSOR_HCSR04
#include "sensors/sensor-hcsr04.h"
#endif

// #if FEATURE_SENSOR_VL53L1X
// #include "sensors/sensor-vl53l1x.h"
// #endif

#if FEATURE_SENSOR_DS18B20
#include "sensors/sensor-ds18b20.h"
#endif

// Button
#ifdef BUTTON_PIN
#include "button/button.h"
#endif

// Confuration
#include "config/config.h"

// Display SD1306
#ifdef FEATURE_DISPLAY_SD1306
#include "displays/display-sd1306.h"
#endif

// LoRaWAN
#ifdef FEATURE_LORAWAN_ENABLED
#include "lora/lora-wan.h"
#endif

unsigned long last_print_time = 0;

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
    Serial.println("🌈\t\t\tStarting regenfass");
    Serial.println("*********************************************************\033[0m\n");

    // Debugging information
    if (CORE_DEBUG_LEVEL > 1)
        Serial.println("Debug:\tenabled");
    else
        Serial.println("Debug:\tdisabled");
    Serial.println("\n\n\n");

    // Configuration
    Config::T::setup();

// Sensors
#if FEATURE_SENSOR_HCSR04
    Sensor::HCSR04::setup();
#endif

#if FEATURE_SENSOR_VL53L1X
//    Sensor::VL53L1X::setup();
#endif

// Button
#ifdef BUTTON_PIN
    Button::setup();
#endif

// Display SD1306
#ifdef FEATURE_FEATURE_DISPLAY_SD1306
    Display::SD1306::setup();
#endif

// LoRaWAN
#ifdef FEATURE_LORAWAN_ENABLED
    Lora::Wan::setup();
    Lora::Wan::publish2TTN(); // Initial Send to Trigger OTAA Join
#endif
}

void loop()
{
    // Publish Something, or Lora Does Noting
    unsigned long current_time = millis();
    if (current_time - last_print_time >= 20000)
    {
        Lora::Wan::publish2TTN();
        last_print_time = current_time;
    }

// Sensor
#if FEATURE_SENSOR_HCSR04
    Sensor::HCSR04::loop();
#endif

// #if FEATURE_SENSOR_VL53L1X
//     Sensor::VL53L1X::loop();
// #endif

// Button
#ifdef BUTTON_PIN
    Button::loop();
#endif

// Display SD1306
// #FIXME: Display-Code is to slow and interferes with LoRa / LMIC-Timings
// #ifdef FEATURE_DISPLAY_SD1306
//     Display::SD1306::loop();
// #endif

// LoRaWAN
#ifdef FEATURE_LORAWAN_ENABLED
    Lora::Wan::loop();
#endif
}
