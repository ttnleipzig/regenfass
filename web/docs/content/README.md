# regenfass

> This project is about a smart water tank. It measures the water level and sends the data to a server. The server can be used to control the water pump. The pump can be controlled via a web interface or via a telegram bot. It uses a  HC-SR04 ultrasonic sensor to measure the water level. The data is sent to TTN via a LoRaWAN gateway.

---
## Table Of Content

1. **Quickstart**
   1. Introduction
   2. Hardware
   3. Flash software
2. **Hardware**
   1. Sensors
   2. Power supply
   3. Housing
   4. Microcontroller
   5. Gateway (optional)
3. **Assembling**
   1. Sensor to controller
   2. Power to controller
   3. Trouble shooting
4. **Setup**
   1. TTN
      1. Create Account
      2. Create App
      3. Configure Devoder
      4. Copy Credentials
   2. Device
      1. Download driver
      2. Flashing
      3. Configuration
5. **Debugging**
   1. Serial Monitor
   2. TTN Console
   3. MQTT Client
   4. Pit falls
6. **Data Engineering**
   1. Node RED
   2. Grafana
   3. Alexa Skill
   4. Azure Connect

---

## Quick start

### Quick start - Introduction

The quickstart is made for people who want to start right away and deep knowledge about IoT with the Arudino Framework. If you want to understand how it works, you can read the [ documentation](#hardware).

### Quick start - Hardware overview

You need the following parts:

![Overview](_media/hardware/hardware-overview.png)

* Microcontroller with LoRa chip
* Sensor
* Power supply
* Housing

> If you want to know more about the parts, you can read the [ hardware documentation](#Hardware).

### Quick start - Flash software

1. Connect your board to your computer and
2. Click on the following button:

[Open the web installer](https://install.regenfass.eu)

> If you want to know more about the flashing process, you can read the [ setup documentation](#Setup).

## Hardware

   1. [Sensors](#Sensors)
   2. [Power supply](#Power-supply)
   3. [Housing](#Housing)
   4. [Microcontroller](#Microcontroller)
   5. [Gateway](#Gateway)

### Sensors

To messure the water level you need a sensor.  It is not an easy task to find a sensor that is waterproof and can be used in a water tank. The following sensors are supported and recommended:

#### Beginner

If you are a beginner, we recommend using cheap sensors to build your first prototype. The following sensors are supported and recommended:

| Part                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![HC-S04 sensor](_media/hardware/sensor-hcsr04.svg) | [HC-SR04 Ultrasonic Sensor](https://amzn.to/3MHNrbJ) The sensor is relativly cheap and easy to use. It is not waterproof. You have to put it in a waterproof housing. We recoment this sensor if you just want to try it out. It is not recommended for long term use. The **HC-SR04** sensor is an ultrasonic sensor used for distance measurement. It emits high frequency sound waves and detects the time it takes for the waves to bounce back after hitting an object. This time is then used to calculate the distance between the sensor and the object. It has a range of up to 4 meters and can be interfaced with microcontrollers like Arduino, Raspberry Pi, etc. The HC-SR04 is commonly used in robotics, automation, security systems, and other applications that require accurate and reliable distance sensing. |
| ![](_media/hardware/sensor-vl6180x.svg)             | [VL6180X](https://amzn.to/3zVEFPM) The time of flight sensor is relativly cheap and easy to use. The VL6180X Laser Distance Module is a sensor that uses a laser to measure the distance between the sensor and an object. It is a time-of-flight (ToF) sensor, which means that it measures the time it takes for the laser light to bounce off an object and return to the sensor. The sensor is not waterproof but has a higher acuracy. You have to put it in a waterproof housing. We recoment this sensor if you just want to try it out. It is not recommended for long term use.                                                                                                                                                                                                                                           |

#### Advanced

If you want to use that project for a long time, we recommend using more expensive sensors. The following sensors are supported and recommended:

| Part                                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![CQRobot](_media/hardware/sensor-water-CQRobot.svg)                   | [Contact water level sensor](https://amzn.to/41sKAaL) This sensor utilizes optical principles to detect liquid levels and is known as a photoelectric water liquid level sensor. One major advantage of this type of sensor is its excellent sensitivity and lack of mechanical parts, which leads to less frequent calibration. The sensor probe itself is small and flexible in terms of placement orientation, allowing it to detect a variety of conditions such as solution spillage, dryness, and horizontal level. Additionally, this sensor can function as a reminder and alarm system. The device features a built-in emitting diode and phototransistor, with the charged portion completely isolated from the controlled liquid, ensuring safety.                                                                                                                                                                                                                                                                                                                                                                                                            |
| ![Water proof Ultrasonic Sensor](_media/hardware/sensor-JSN-SR04T.svg) | [Water proof Ultrasonic Sensor](https://amzn.to/3MNk4F2) The JSN-SR04T is an ultrasonic sensor module that utilizes sonar technology to detect the distance of objects. This compact and easy-to-use module features high accuracy and reliability, making it an ideal choice for a wide range of applications including robotics, automation, and security systems. The sensor has a detection range of up to 5 meters and can detect objects within a 15-degree angle. It operates at a frequency of 40 kHz and has a resolution of 1 cm. The module also includes a built-in temperature compensation function, ensuring stable and accurate readings even in varying temperature conditions. **The JSN-SR04T** module is designed with a waterproof and dustproof casing, making it suitable for use in harsh environments. It is easy to install and integrates seamlessly with a wide range of microcontrollers, such as Arduino and Raspberry Pi, through its simple three-pin interface. Overall, the JSN-SR04T ultrasonic sensor module is an excellent choice for anyone looking for a reliable and accurate distance measurement solution for their projects. |

### Power supply

To power the microcontroller you need a power supply. The 18650 battery is the best option. It is cheap and you can charge it with a solar panel. But you can also use a power bank or a USB power supply.

| Part                                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![18650 battery](_media/hardware/hardware-18650.svg)    | There are many types of batteries. The most common are Lithium Ion, Lithium Polymer and Lithium Iron Phosphate. The **18650 battery** is a Lithium Ion battery. It is the best option for this project. It is cheap and you can charge it with a solar panel. It is made of Lithium Ion and can be charged up to 500 times. 18650 battery has a voltage of 3.7V and can have a capacity of araound 2200mAh. The solar panel has a voltage of 5V and a power of 2W. The solar panel can charge the battery in 3 hours. Our sensor needs 5V and 100mA. The microcontroller needs 5V and 100mA. So we need two 18650 batteries an a voltage regulator to get 5V. The battery is not waterproof. You have to put it in a waterproof housing. Also take care about high temperatures. The battery can explode if it is too hot. We recommend this battery if you want to use it for a long time. |
| ![Solar panel](_media/hardware/hardware-solarpanel.svg) | **Solar panel:** Since we are in our garden, we can use a solar panel. It is waterproof and can be used in the rain. It is made of polycrystalline silicon and has a power of 2W. If you buy a solar panel, you have to make shure that it has a 5V output with at least 400mA. To charge our batteries, we need a charge controller. Luckely the Microcontroller has a charge controller build in. So we can use the solar panel directly.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Housing

To protect the sensor and the microcontroller you need a housings. The housing has to be waterproof and a little bit resistant to high temperatures and UV radiation.
Use **PETG** is good for prototypes. It is not waterproof and can be destroyed by UV radiation. Use **PETG** for long term use. It is waterproof and UV resistant. You can also use **ABS**. It is waterproof and UV resistant.

Even **tupperware** is a good option. It is waterproof and UV resistant.

### Microcontroller

The microcontroller is the brain of the system. It is responsible for measuring the water level and sending the data to the server. The following microcontrollers are supported and recommended:

| Part                                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Seamuing SX1262 LoRa Modul](_media/hardware/hardware-esplora.svg) | The [Seamuing SX1262 LoRa Modul 868](https://amzn.to/3UFRGq5) is a microcontroller with a LoRa module. It is cheap and easy to use.The SX1262 is a highly integrated low-power, long-range transceiver designed for use in a variety of wireless communication applications. It features an ultra-low power consumption mode, which makes it ideal for battery-powered applications that require long battery life. The SX1262 utilizes the LoRa modulation technique, which enables long-range communication with minimal power consumption. With a range of up to 15 km in line-of-sight conditions and up to 2 km in urban environments, the SX1262 is an excellent choice for long-range wireless communication applications. The transceiver operates in the 860-930 MHz frequency range, making it compatible with a wide range of regional regulatory requirements. It also features a high sensitivity of -148 dBm, enabling reliable communication even in noisy or weak signal environments. The SX1262 is designed with a highly configurable interface, making it easy to integrate into a wide range of applications. It also features a low-power standby mode, which reduces power consumption when the transceiver is not in use. Overall, the SX1262 is a highly versatile and reliable transceiver solution that is ideal for a wide range of wireless communication applications, including IoT, smart metering, and industrial automation. **It is not waterproof.** You have to put it in a waterproof housing. We recoment this microcontroller if you just want to try it out. It is not recommended for long term use. |

### Gateway

Check the TTN map to see if there is a gateway near you. If there is no gateway near you, you can buy a gateway but you need a internet connection. The gateway is the bridge between the microcontroller and the TTN server. The following gateways are supported and recommended:

| Part                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![TTN gateway](_media/hardware/hardware-gateway.svg) | [TTN Indoor Gateway](https://amzn.to/3L1x1JN) The gateway is designed to work seamlessly with The Things Network v3, which offers a range of features such as secure device activation, global coverage, and easy device management. It also features built-in support for Bluetooth Low Energy (BLE) and Wi-Fi, enabling easy configuration and management using a smartphone or computer. Overall, the Things Indoor LoRaWAN Indoor Gateway TTNv3 is an excellent choice for anyone looking for a reliable, easy-to-use gateway for their LoRaWAN network. It is affordable, energy-efficient, and packed with features that make it an ideal choice for both commercial and industrial IoT applications. |

## 3. Assembeling

   1. [Sensor to controller](#sensor-to-controller)
   2. [Power to controller](#power-to-controller)
   3. [Trouble shooting](#trouble-shooting)

### Sensor to controller

This example illustrates how to assemble the HC-SR04 sensor to the microcontroller. The sensor is connected to the microcontroller with a 4 pin cable. The yellow cable is the trigger cable. The blue cable is the echo cable. The red cable is the 5V cable. The black cable is the ground cable.

![Schema for ultra sonic sensor](_media/schema/schema-regenfass-ultrasonic.png)

### Power to controller

### Trouble shooting

---

#### LoRaWAN

* LoRaWAN Gateway
#### Micro controller

It is ovious that you need a board to run the software. But you also need a LoRa chip to send the data to TTN. The following boards are supported:

* [TTGO LoRa32](Hardware/TTGOLoRa32.md)
* [Heltec LoRa32](Hardware/HeltecLoRa32.md)

### Schematic

![Schematic](https://raw.githubusercontent.com/Regenfass/Regenfass/master/Hardware/Schematic.png)

### 3D-Printed Parts

## Software

### Arduino

* [Arduino](Software/Arduino/README.md)

### Server

* [Server](Software/Server/README.md)

### Telegram Bot

* [Telegram Bot](Software/TelegramBot/README.md)


## Contribute

Improvements welcome on [GitHub](https://github.com/ttnleipzig/regenfass).

## License

[Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**You are free to:**

* Share — copy and redistribute the material in any medium or format
* Adapt — remix, transform, and build upon the material

---
