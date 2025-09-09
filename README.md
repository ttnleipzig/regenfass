# 🌈 regenfass

[![Build Environments](https://github.com/ttnleipzig/regenfass/actions/workflows/sketch-release.yml/badge.svg)](https://github.com/ttnleipzig/regenfass/actions/workflows/sketch-release.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ttnleipzig/regenfass)](https://github.com/ttnleipzig/regenfass/releases)
[![GitHub issues](https://img.shields.io/github/issues/ttnleipzig/regenfass)](https://github.com/ttnleipzig/regenfass/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/ttnleipzig/regenfass)](https://github.com/ttnleipzig/regenfass/pulls)
[![GitHub last commit](https://img.shields.io/github/last-commit/ttnleipzig/regenfass)](https://github.com/ttnleipzig/regenfass/commits/main)
![GitHub repo size](https://img.shields.io/github/repo-size/ttnleipzig/regenfass)
[![codecov](https://codecov.io/gh/ttnleipzig/regenfass/graph/badge.svg?token=Q0DB4PG8UB)](https://codecov.io/gh/ttnleipzig/regenfass)

Regenfass is a demonstration for advanced programming techniques in **C++** with the **Arduino Framework** and **LoRaWAN** on the **The Things Network** (TTN).

Our documentation is the best place for
[getting started](https://regenfass.ttn-leipzig.de).

## 🚀 Features

* [ ] LoRaWAN 1.0.2, OTAA
* [ ] Support for different microcontrollers
* [ ] Support for different LoRaWAN modules

### 📟 Display content

* [ ] Show the water level
* [ ] Show the battery level
* [ ] Show the signal strength

### 🌡️  Sensors

* [x] Messure the water level with different sensors
* [ ] Support for different sensors

### 🔴 Button

* [ ] Short press: Send a message instantly
* [ ] Long press: Turn on/off the display
* [ ] Double press: Turn on/off the sleep mode
* [ ] Triple press: Reset the device

### 🔋 Battery

* [ ] Support for different battery types
* [ ] Battery level indicator
* [ ] Low battery warning
* [ ] Sleep mode with wake up on button press
* [ ] Solar panel support

## 📦 Hardware

We build binary releases for different hardware. The following table shows the current status. There are many of them, because you can combine different microcontrollers, LoRaWAN modules, displays and sensors.

### 🔧 Hardware Setup Example

Here's a typical setup using the Heltec WiFi LoRa 32 V3 with HC-SR04 sensor:

**Components needed:**
- Heltec WiFi LoRa 32 V3 board
- HC-SR04 ultrasonic sensor
- Rain barrel or water container
- Waterproof enclosure
- Jumper wires

**Wiring:**
```
Heltec WiFi LoRa 32 V3  <->  HC-SR04 Sensor
VCC (3.3V)             <->  VCC
GND                    <->  GND
GPIO 19                <->  Trigger
GPIO 20                <->  Echo
```

**Installation:**
1. Mount the sensor at the top of your rain barrel
2. Ensure the sensor faces downward toward the water surface
3. Keep sensor at least 30cm away from barrel walls
4. Secure all connections in a waterproof enclosure

### 🗳️ Microcontrollers

 We support different microcontrollers. The following table shows the current status.

| Microcontroller | Status |
| --------------- | ------ |
| Heltec WiFi LoRa 32 V2 | ✅ |
| Heltec WiFi LoRa 32 V3 | ✅ |
| STM32 | ⏳ |
| ESP32 | ⏳ |

### 📡 LoRaWAN Modules

We support different LoRaWAN modules. The following table shows the current status.

| Module | Status |
| ------ | ------ |
| Heltec WiFi LoRa 32 V2 | ✅ |
| Heltec WiFi LoRa 32 V3 | ✅ |
| Dragino LoRa Shield | ⏳ |
| Dragino LoRa/GPS HAT | ⏳ |

### 📟 Display modules

We support different displays. The following table shows the current status.

| Display | Status |
| ------- | ------ |
| SSD1306 | ✅ |
| SH1106 | ⏳ |

### 🌡️ Sensors

We support different sensors. The following table shows the current status.

| Sensor | Status |
| ------ | ------ |
| HC-SR04 | ✅ |
| VL53L1X | ⏳ |
| DS18B20 | ⏳ |

## 🛠️ Configurations

Some settings we can not put into the binary releases, because this data belongs to you and in some case there are sensitive data.
The following table shows the current status.

| Configuration | Status |
| ------------- | ------ |
| LoRa App Key | ⏳ |
| LoRa App Eui | ⏳ |
| LoRa Dev Eui | ⏳ |
| LoRa Region | ⏳ |

### 📡 LoRaWAN Configuration Example

Before using the device, you need to configure your LoRaWAN credentials from The Things Network:

**Step 1: Create TTN Application**
1. Go to [The Things Network Console](https://console.thethingsnetwork.org/)
2. Create a new application
3. Add a new device with OTAA activation

**Step 2: Get your credentials**
```cpp
// Example credentials (replace with your own):
const char* appEui = "70B3D57ED005B420";  // Application EUI from TTN
const char* appKey = "01234567890ABCDEF01234567890ABCDEF";  // App Key from TTN  
const char* devEui = "70B3D57ED005B420";  // Device EUI from TTN
```

**Step 3: Configure your region**
```cpp
// For Europe (EU868)
#define CFG_eu868 1
// For US (US915) 
#define CFG_us915 1
```

**Step 4: Sensor calibration**
```cpp
// Configure your barrel dimensions
#define BARREL_HEIGHT_CM 100        // Total height of your barrel
#define SENSOR_OFFSET_CM 10         // Distance from sensor to full water level
#define BARREL_DIAMETER_CM 60       // Diameter for volume calculation
```

## 👩‍💻 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

### 👷‍♀️ Building

The project is build with [PlatformIO](https://platformio.org/). Please install the [PlatformIO IDE](https://platformio.org/platformio-ide) for your favorite IDE.

### 💡 Usage Examples

**Basic Water Level Monitoring:**
Once configured and installed, the device will:

1. **Automatic measurements:** Take water level readings every 15 minutes
2. **LoRaWAN transmission:** Send data to TTN automatically
3. **Battery monitoring:** Track and report battery status

**Sample LoRaWAN payload:**
```json
{
  "water_level_cm": 45,
  "water_percentage": 75,
  "battery_voltage": 3.7,
  "signal_strength": -85
}
```

**Button operations:**
- **Short press:** Force immediate measurement and transmission
- **Long press (3s):** Toggle display on/off (power saving)
- **Double press:** Toggle sleep mode on/off  
- **Triple press:** Factory reset device

**Reading TTN data:**
Access your data via:
- TTN Console → Applications → Your App → Live Data
- TTN MQTT API for integration with other systems
- TTN HTTP Integration for webhooks

**Expected battery life:**
- With sleep mode: 6-12 months (depending on transmission interval)
- Without sleep mode: 2-4 weeks
- With solar panel: Indefinite operation

## 📝 Documentation

You can find the documentation on [regenfass.ttn-leipzig.de](https://regenfass.ttn-leipzig.de).

## 🔧 Troubleshooting Examples

**Problem: Device not sending data to TTN**
```bash
# Check LoRaWAN configuration
pio device monitor
# Look for output like:
# [ERROR] LoRaWAN: Join failed
# [ERROR] LoRaWAN: Invalid keys

# Solution: Verify your TTN credentials
LORA_APP_EUI?
LORA_APP_KEY?
```

**Problem: Incorrect water level readings**
```bash
# Check sensor readings in serial monitor:
# Water level: -5.2 cm (Invalid)
# Water level: 999.9 cm (Out of range)

# Solution: Recalibrate sensor
SENSOR_OFFSET=10        # Adjust based on your setup
BARREL_HEIGHT=100       # Set your actual barrel height
MEASURE_NOW!            # Test measurement
```

**Problem: Poor battery life**
```bash
# Check power consumption settings
SLEEP_MODE?             # Should be enabled for battery operation
MEASURE_INTERVAL?       # Increase interval to save power

# Enable power saving
SLEEP_MODE=enabled
MEASURE_INTERVAL=60     # Measure once per hour
```

**Problem: Build errors**
```bash
# Clean build directory
pio run --target clean

# Update dependencies  
pio lib update

# Rebuild
pio run --environment heltec_wifi_lora_32_V3_HCSR04
```

## 📜 License

This project is licensed under the [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) License.

## 🙏 Contribute

You are very welcome to contribute. Start by reading the [](CONTRIBUTING.md).

## Stats

![Alt](https://repobeats.axiom.co/api/embed/bd10769e15da93a3e5b1d06a6a005d248df1c61c.svg "Repobeats analytics image")

## ❤️ Thanks

* [The Things Network Leipzig](https://ttn-leipzig.de)
* [SlimeVR Projekt](https://github.com/SlimeVR/SlimeVR-Firmware-WebBuilder)
* [PlatformIO](https://platformio.org/)
* [LoRaWAN](https://lora-alliance.org/)
