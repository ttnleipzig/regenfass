# regenfass - Installer

[![codecov](https://codecov.io/gh/ttnleipzig/regenfass/graph/badge.svg?token=Q0DB4PG8UB)](https://codecov.io/gh/ttnleipzig/regenfass)
[![Installer - test](https://github.com/ttnleipzig/regenfass/actions/workflows/installer-test.yml/badge.svg)](https://github.com/ttnleipzig/regenfass/actions/workflows/installer-test.yml)

The regenfass installer helps you configure and flash the firmware to your device with the correct settings for your specific hardware and LoRaWAN setup.

## 🚀 Quick Start Example

**Step 1: Install dependencies**
```bash
pnpm install
```

**Step 2: Configure your device**
```bash
# Example configuration for Heltec WiFi LoRa 32 V3
export BOARD=heltec_wifi_lora_32_V3
export SENSOR=HCSR04
export LORA_REGION=EU868
export APP_EUI=70B3D57ED005B420
export APP_KEY=01234567890ABCDEF01234567890ABCDEF
export DEV_EUI=70B3D57ED005B420
```

**Step 3: Flash firmware**
```bash
# Connect your device via USB
# Run the installer
npm run flash
```

## 📋 Installation Examples

### Example 1: Standard Rain Barrel Setup
```bash
# For a typical European rain barrel (100L, HC-SR04 sensor)
./installer --board heltec_v3 --sensor hcsr04 --region eu868 \
  --barrel-height 100 --barrel-diameter 60 \
  --app-eui "YOUR_APP_EUI" --app-key "YOUR_APP_KEY"
```

### Example 2: Large Water Tank Setup  
```bash
# For a large water tank (1000L, VL53L1X sensor for better accuracy)
./installer --board heltec_v3 --sensor vl53l1x --region us915 \
  --barrel-height 200 --barrel-diameter 120 \
  --measurement-interval 30 --sleep-mode enabled
```

### Example 3: Development/Testing Setup
```bash
# Quick setup for testing (no sleep mode, frequent measurements)
./installer --board heltec_v3 --sensor hcsr04 --region eu868 \
  --measurement-interval 5 --sleep-mode disabled --debug enabled
```

## 🔧 Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `--board` | Microcontroller board | `heltec_v3`, `esp32` |
| `--sensor` | Water level sensor type | `hcsr04`, `vl53l1x`, `ds18b20` |
| `--region` | LoRaWAN frequency region | `eu868`, `us915`, `as923` |
| `--barrel-height` | Container height in cm | `100` |
| `--barrel-diameter` | Container diameter in cm | `60` |
| `--measurement-interval` | Minutes between readings | `15` |
| `--sleep-mode` | Enable power saving | `enabled`, `disabled` |
| `--debug` | Enable debug output | `enabled`, `disabled` |

## Contributing

### Tests

#### Tasks

* `pnpm exec playwright codegen wikipedia.com`
* `pnpm exec playwright test`
* `pnpm exec playwright test --ui`
* `pnpm exec playwright show-report`

## How to run

```bash
pnpm install
pnpm exec playwright test
```
