#include "version.h"

// Libraries
#include <Arduino.h>
#include <esp32-hal-log.h>

#define SCP_IMPLEMENTATION


// Lora32 Battery Voltage
#if FEATURE_LORA32_VBAT
#include "sensors/sensor-lora32battery.h"
#endif

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
Lora::Wan::loraPayload payload;
std::string confMinLevel;
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
    Serial.println("🌈\t\t\tStarting regenfass " REGENFASS_VERSION);
    Serial.println("*********************************************************\033[0m\n");

    // Debugging information
    if (CORE_DEBUG_LEVEL > 1)
        Serial.println("Debug:\tenabled");
    else
        Serial.println("Debug:\tdisabled");
    Serial.println("\n\n\n");

    // Configuration
    Configuration::Configurator::setup();

    // Read minValue from Config
    const auto config = Configuration::Configurator::getConfig();
    confMinLevel = config.minLevel;
    Serial.printf("Configured Minimal Level: %s\n", confMinLevel);

// Lora32 Battery Voltage
#if FEATURE_LORA32_VBAT
    Sensor::Lora32Battery::setup();
#endif

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
    Lora::Wan::publish2TTN(payload); // Initial Send to Trigger OTAA Join
#endif
}

void loop()
{
    Configuration::Configurator::loop();

    // Publish Something, or Lora Does Noting
    unsigned long current_time = millis();
    if (current_time - last_print_time >= 20000)
    {
        payload.minLevel = std::stof(confMinLevel);

#if FEATURE_LORA32_VBAT
        payload.voltage = Sensor::Lora32Battery::readBattery();
#endif

#if FEATURE_SENSOR_HCSR04
        payload.waterLevel = Sensor::HCSR04::measureDistanceCm();
#endif
        Serial.printf("minLevel: %f voltage: %f waterLevel: %f\n", payload.minLevel, payload.voltage, payload.waterLevel);
        Lora::Wan::publish2TTN(payload);
        last_print_time = current_time;
    }

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
