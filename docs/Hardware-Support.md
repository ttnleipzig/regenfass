# Hardware support and feature status

Roadmap and support matrix for regenfass firmware. End users should prefer the [public docs site](https://docs.regenfass.eu); this page is for people working on the firmware or choosing hardware combinations.

Binary releases exist for many combinations of microcontroller, LoRaWAN module, display, and sensor.

## Features

### Connectivity

* [ ] LoRaWAN 1.0.2, OTAA
* [ ] Support for different microcontrollers
* [ ] Support for different LoRaWAN modules

### Display content

* [ ] Show the water level
* [ ] Show the battery level
* [ ] Show the signal strength

### Sensors

* [x] Measure the water level with different sensors
* [ ] Support for different sensors

### Button

* [ ] Short press: Send a message instantly
* [ ] Long press: Turn on/off the display
* [ ] Double press: Turn on/off the sleep mode
* [ ] Triple press: Reset the device

### Battery

* [ ] Support for different battery types
* [ ] Battery level indicator
* [ ] Low battery warning
* [ ] Sleep mode with wake up on button press
* [ ] Solar panel support

## Microcontrollers

| Microcontroller        | Status |
| ---------------------- | ------ |
| Heltec WiFi LoRa 32 V2 | ✅      |
| Heltec WiFi LoRa 32 V3 | ✅      |
| STM32                  | ⏳      |
| ESP32                  | ⏳      |

## LoRaWAN modules

| Module                 | Status |
| ---------------------- | ------ |
| Heltec WiFi LoRa 32 V2 | ✅      |
| Heltec WiFi LoRa 32 V3 | ✅      |
| Dragino LoRa Shield    | ⏳      |
| Dragino LoRa/GPS HAT   | ⏳      |

## Display modules

| Display | Status |
| ------- | ------ |
| SSD1306 | ✅      |
| SH1106  | ⏳      |

## Sensors

| Sensor  | Status |
| ------- | ------ |
| HC-SR04 | ✅      |
| VL53L1X | ⏳      |
| DS18B20 | ⏳      |

## Device configuration

Some settings cannot ship inside the binary releases because they belong to the device owner and may include sensitive data. Status of that work:

| Configuration | Status |
| ------------- | ------ |
| LoRa App Key  | ⏳      |
| LoRa App Eui  | ⏳      |
| LoRa Region   | ⏳      |
| LoRa Dev Eui  | ⏳      |

The web [installer](https://install.regenfass.eu) is the intended path for writing these values via Serial Configuration Protocol (SCP).

## Related

* [Architecture](Architecture)
* [Local Development](Local-Development)
* [Project Structure](Project-Structure)
* Public sites: [regenfass.eu](https://regenfass.eu) · [docs.regenfass.eu](https://docs.regenfass.eu) · [install.regenfass.eu](https://install.regenfass.eu)
