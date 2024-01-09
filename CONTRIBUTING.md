# Contribute

## 👩‍💻 How to contribute

### Development

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Create a pull request
5. Address any review comments
6. Merge the pull request once it is approved

### Bug reports

1. Create a new issue
2. Describe the steps to reproduce the bug
3. Describe the expected behavior
4. Describe the actual behavior
5. Describe the environment
(OS, browser, etc.)
6. Include any relevant stack traces or error messages

## 👷‍♀️ Development

### Requirements

* [PlatformIO](https://platformio.org/)
* [PlatformIO IDE](https://platformio.org/platformio-ide) for your favorite IDE

### Configuration

Get the merged platformio.ini configuration for debugging:

```bash
pio project config
```

Get default environment:

```bash
pio project config --json-output | jq -cr '.[0][1][0][1]'
```

Result: `["heltec_wifi_lora_32_V3_HCSR04"]`

### Build & Upload

Build the project:

```bash
pio run --environment <environment>
```

Build and upload the project:

```bash
pio run --target upload --environment <environment>
```

## Debug level

The debug level can be set in the `platformio.ini` file.

```ini
[env:heltec_wifi_lora_32_V3_HCSR04]
```
