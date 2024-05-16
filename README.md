# 🌈 regenfass

[![Build Environments](https://github.com/ttnleipzig/regenfass/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/ttnleipzig/regenfass/actions/workflows/build-and-release.yml)
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

## 👩‍💻 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

### 👷‍♀️ Building

The project is build with [PlatformIO](https://platformio.org/). Please install the [PlatformIO IDE](https://platformio.org/platformio-ide) for your favorite IDE.

## 📝 Documentation

You can find the documentation on [regenfass.ttn-leipzig.de](https://regenfass.ttn-leipzig.de).

## 📜 License

This project is licensed under the [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) License.

## 🙏 Contribute

You are very welcome to contribute. Start by reading the [](CONTRIBUTING.md).

## Stats

![Alt](https://repobeats.axiom.co/api/embed/bd10769e15da93a3e5b1d06a6a005d248df1c61c.svg "Repobeats analytics image")
