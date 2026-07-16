# regenfass

[![Build Environments](https://github.com/ttnleipzig/regenfass/actions/workflows/sketch-release.yml/badge.svg)](https://github.com/ttnleipzig/regenfass/actions/workflows/sketch-release.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ttnleipzig/regenfass)](https://github.com/ttnleipzig/regenfass/releases)
[![GitHub issues](https://img.shields.io/github/issues/ttnleipzig/regenfass)](https://github.com/ttnleipzig/regenfass/issues)
[![codecov](https://codecov.io/gh/ttnleipzig/regenfass/graph/badge.svg?token=Q0DB4PG8UB)](https://codecov.io/gh/ttnleipzig/regenfass)

**regenfass** (“rain barrel”) is an open IoT project for measuring water levels and sending the data over **LoRaWAN** via **The Things Network** (TTN). It combines ESP32 firmware with browser-based tools so you can flash a board, configure credentials, and follow the sensor readings without a custom desktop app.

## Where to go

| Site           | URL                                                  | What you get                                   |
| -------------- | ---------------------------------------------------- | ---------------------------------------------- |
| Project site   | [regenfass.eu](https://regenfass.eu)                 | Overview and project story                     |
| Documentation  | [docs.regenfass.eu](https://docs.regenfass.eu)       | Guides for setup and everyday use              |
| Installer      | [install.regenfass.eu](https://install.regenfass.eu) | Flash and configure your device in the browser |
| Brand showcase | [brand.regenfass.eu](https://brand.regenfass.eu)     | Shared UI components and design playground     |

Start with the [documentation site](https://docs.regenfass.eu) if you are new, or open the [installer](https://install.regenfass.eu) when your hardware is ready (Chromium-based browser and USB connection required).

## What it does

* Measure water level in a rain barrel (or similar tank) with supported sensors
* Send readings over LoRaWAN / TTN with low power in mind
* Flash firmware and set device configuration from the web installer
* Show status on supported OLED displays (when the board has one)

Supported boards, sensors, and the current roadmap live in the [contributor wiki](https://github.com/ttnleipzig/regenfass/wiki/Hardware-Support).

## Contributing

Technical docs for building firmware, web apps, CI, and the dashboard are in the [GitHub Wiki](https://github.com/ttnleipzig/regenfass/wiki) (source under [`docs/`](docs/Home.md)). For how to send pull requests and report issues, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Thanks

* [The Things Network Leipzig](https://ttn-leipzig.de)
* [SlimeVR Project](https://github.com/SlimeVR/SlimeVR-Firmware-WebBuilder)
* [PlatformIO](https://platformio.org/)
* [LoRaWAN](https://lora-alliance.org/)
