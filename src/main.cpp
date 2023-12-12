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

// LoRaWAN
#ifdef LORAWAN_ENABLED
#include "lora/lora-wan.h"
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
    Serial.println("🌈\t\t\tStarting regenfass");
    Serial.println("*********************************************************\033[0m\n");

    // Debugging information
    if (CORE_DEBUG_LEVEL > 1)
        Serial.println("Debug:\tenabled");
    else
        Serial.println("Debug:\tdisabled");
    Serial.println("\n\n\n");

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

// LoRaWAN
#ifdef LORAWAN_ENABLED
    Lora::Wan::setup();
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

// LoRaWAN
#ifdef LORAWAN_ENABLED
    Lora::Wan::loop();
#endif
}
