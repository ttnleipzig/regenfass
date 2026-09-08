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

#if FEATURE_SENSOR_VL53L0X
#include "sensors/sensor-vl53l0x.h"
#endif

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
#include "lora/protocol.h"
#endif

// Default publish interval (seconds) used when `publishInterval` is not set in
// the runtime configuration. Configurable at runtime via the SCP config key.
#define PUBLISH_INTERVAL_DEFAULT_S 30
unsigned long last_print_time = 0;

// Returns the configured publish interval in milliseconds, falling back to the
// default when the `publishInterval` config key is unset or invalid.
unsigned long publishIntervalMs()
{
    const auto &interval = Configuration::Configurator::getConfig().publishInterval;
    unsigned long seconds = PUBLISH_INTERVAL_DEFAULT_S;
    if (!interval.empty())
    {
        char *end = nullptr;
        unsigned long parsed = strtoul(interval.c_str(), &end, 10);
        if (end != interval.c_str() && parsed > 0)
            seconds = parsed;
    }
    return seconds * 1000UL;
}

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

#if FEATURE_SENSOR_VL53L0X
    Sensor::VL53L0X::setup();
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
    Lora::Wan::publish2TTN({}); // Initial Send to Trigger OTAA Join
#endif
}

void loop()
{
    Configuration::Configurator::loop();

    // Publish Something, or Lora Does Noting
    unsigned long current_time = millis();
    if (current_time - last_print_time >= publishIntervalMs())
    {
        std::vector<Lora::Protocol::DataPoint> data_points;

#if FEATURE_LORA32_VBAT
        data_points.push_back(Lora::Protocol::DataPoint{
            .measurement_type = Lora::Protocol::MeasurementType::Voltage,
            .channel_id = Lora::Protocol::ChannelID::_1,
            .value = Sensor::Lora32Battery::readBattery(),
        });
#endif

#if FEATURE_SENSOR_HCSR04
        data_points.push_back(Lora::Protocol::DataPoint{
            .measurement_type = Lora::Protocol::MeasurementType::Distance,
            .channel_id = Lora::Protocol::ChannelID::_2,
            .value = Sensor::HCSR04::measureDistanceCm(),
        });
#endif

#if FEATURE_SENSOR_VL53L0X
        const float vl53l0x_distance = Sensor::VL53L0X::measureDistanceCm();
        if (!isnan(vl53l0x_distance))
        {
            data_points.push_back(Lora::Protocol::DataPoint{
                .measurement_type = Lora::Protocol::MeasurementType::Distance,
                .channel_id = Lora::Protocol::ChannelID::_3,
                .value = vl53l0x_distance,
            });
        }
#endif

        Lora::Wan::publish2TTN(data_points);
        last_print_time = current_time;
    }

// Sensor
#if FEATURE_SENSOR_HCSR04
    Sensor::HCSR04::loop();
#endif

// #if FEATURE_SENSOR_VL53L1X
//     Sensor::VL53L1X::loop();
// #endif

#if FEATURE_SENSOR_VL53L0X
    Sensor::VL53L0X::loop();
#endif

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
