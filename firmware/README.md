# Regenfass Firmware

![Regenfass Firmware](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-regenfass-project.svg)

The Regenfass firmware runs on supported ESP32 boards, measures water levels,
and sends readings over LoRaWAN through The Things Network. PlatformIO
environments cover the supported board and sensor combinations.

## Technology

- C++17 with the Arduino framework
- ESP32 boards
- PlatformIO
- LoRaWAN and The Things Network
- HCSR04, VL53L1X, and DS18B20 sensor support where configured

## Development

Install [PlatformIO](https://platformio.org/), then run commands from this
directory:

```bash
pio run
```

To build one environment explicitly:

```bash
pio run --environment heltec_wifi_lora_32_V3_HCSR04
```

Keep real device credentials out of version control. Configure devices through
the web installer or a local ignored PlatformIO override.

## Checks and upload

```bash
pio test
pio run --target upload --environment <environment>
```

See the repository [contribution guide](../CONTRIBUTING.md) for hardware and
development workflow details.
