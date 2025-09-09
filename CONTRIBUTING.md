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

### 🔨 Build Examples

**Example 1: Building for Heltec WiFi LoRa 32 V3 with HC-SR04**
```bash
cd regenfass/
pio run --environment heltec_wifi_lora_32_V3_HCSR04
```

Expected output:
```
Environment    Status    Duration
-------------  --------  ------------
heltec_wifi_lora_32_V3_HCSR04  SUCCESS   00:00:45.123
========================= 1 succeeded, 0 failed, 0 skipped =========================
```

**Example 2: Upload to connected device**  
```bash
pio run --target upload --environment heltec_wifi_lora_32_V3_HCSR04
```

**Example 3: Monitor serial output**
```bash
pio device monitor --environment heltec_wifi_lora_32_V3_HCSR04
```

Expected serial output:
```
[12:34:56] Water level: 45.2 cm (75%)
[12:34:56] Battery: 3.7V
[12:34:56] Sending LoRaWAN packet...
[12:34:58] LoRaWAN: TX complete
```

**Example 4: Building all environments**
```bash
pio run
```

This builds all configured environments in platformio.ini.

## Debug level

The debug level can be set in the `platformio.ini` file.

```ini
[env:heltec_wifi_lora_32_V3_HCSR04]
```

## 🤖 Deployment

### Semantic versioning

We follow [semantic versioning](https://semver.org/) for this project.

### Conventional Commits

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for this project.
Please use the following commit message format:

```text
<type>[optional scope]: <description>
````

The `<type>` must be one of the following:

| Type | Description | Bump |
| --- | --- | --- |
| `feat` | A new feature | minor |
| `fix` | A bug fix | patch |
| `docs` | Documentation only changes | patch |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
| `refactor` | A code change that neither fixes a bug nor adds a feature | patch |
| `perf` | A code change that improves performance | patch |
| `test` | Adding missing tests or correcting existing tests | patch |
| `chore` | Changes to the build process or auxiliary tools and libraries such as documentation generation | patch |

**Example:**

```text
feat: add support for new sensor
```

### Release management

We use [release please](https://github.com/googleapis/release-please) for this project.
It is implemented in our [release workflow](.github/workflows/release.yml).
It collects all commits since the last release in a release pull request.
Use the [conventional commit](#conventional-commits) message format for your commits like it is described above.
Please write your messages very easy to understand for none developers and a bit more
verbose as useally because it will be used for the Changelog and Release-Notes.

### Workflow for your new feature

1. Create a new branch `feature/sensor-xvz`
2. Develop your feature in your feature branch
3. Create a pull request from your feature branch to the `main` branch
4. Address any review comments
5. Merge the pull request once it is approved and delete your feature branch
6. If not allready done, *please release* will automatically create a new release pull request. This pull request will include your changes.
7. To create a new release, you have to merge the release pull request into the master

### 🔄 Development Workflow Example

**Scenario: Adding support for a new sensor (VL53L1X)**

**Step 1: Create feature branch**
```bash
git checkout -b feature/vl53l1x-sensor
```

**Step 2: Implement the feature**
```bash
# Create sensor implementation
touch src/sensors/sensor-vl53l1x.cpp
touch src/sensors/sensor-vl53l1x.h

# Add configuration to platformio.ini
# Add sensor to main.cpp
```

**Step 3: Test your changes**
```bash
# Build for test environment
pio run --environment heltec_wifi_lora_32_V3_VL53L1X

# Test on hardware
pio run --target upload --environment heltec_wifi_lora_32_V3_VL53L1X
pio device monitor
```

**Step 4: Create pull request**
```bash
git add .
git commit -m "feat: add VL53L1X distance sensor support"
git push origin feature/vl53l1x-sensor
# Create PR via GitHub UI
```

**Step 5: Example commit messages**
```bash
git commit -m "feat: add VL53L1X sensor support"
git commit -m "fix: correct sensor reading calculation"  
git commit -m "docs: update sensor compatibility table"
git commit -m "test: add VL53L1X sensor unit tests"
```

```mermaid
graph LR;
    A((Create new branch))-->B-->Q;
    B[/Create Pull Request/]-->C;
    Q[[Build binary]]-->B;
    C(Review)-->D;
    D((Merge in Master));
```

### Workflow for new releases

1. Merge everthing into the main branch
2. An release pull request will be created automatically by the GitHub Actions workflow
3. Check the release pull request and merge it into the main branch

```mermaid
---
title: Workflow for new releases
---
graph LR;
    A((Merge to main))-->B-->Q;
    B[[Creates Release Pull Request]]-->C;
    Q(Build binary)-->B;
    C(Merge Release Pull request into main)-->D;
    D[[Creates Tag and Release]]-->E;
    E[[Uploads binaries to release]];
```
