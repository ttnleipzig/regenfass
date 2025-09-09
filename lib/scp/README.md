# S(imple)C(onfiguration)P(rotocol)

## Run tests

Tests are written in C++ using [Catch2](https://github.com/catchorg/Catch2).

```bash
make run-tests
```

## Protocol specification

The Simple Configuration Protocol (SCP) allows runtime configuration of device parameters via serial interface.

### 🔧 Usage Examples

**Example 1: Configure LoRaWAN settings**
```bash
# Set App EUI
LORA_APP_EUI=70B3D57ED005B420

# Set App Key  
LORA_APP_KEY=01234567890ABCDEF01234567890ABCDEF

# Set Device EUI
LORA_DEV_EUI=70B3D57ED005B420

# Query current App EUI
LORA_APP_EUI?
# Response: LORA_APP_EUI=70B3D57ED005B420
```

**Example 2: Configure sensor parameters**
```bash
# Set measurement interval (minutes)
MEASURE_INTERVAL=15

# Set barrel height (cm)
BARREL_HEIGHT=100

# Set sensor calibration offset
SENSOR_OFFSET=5

# Query all sensor settings
MEASURE_INTERVAL?
BARREL_HEIGHT?
SENSOR_OFFSET?
```

**Example 3: System actions**
```bash
# Force immediate measurement
MEASURE_NOW!

# Reset device
RESET!

# Enter sleep mode
SLEEP!

# Save configuration to flash
SAVE_CONFIG!
```

**Example 4: Complete configuration session**
```bash
# Configure a new device step by step
LORA_APP_EUI=70B3D57ED005B420
LORA_APP_KEY=01234567890ABCDEF01234567890ABCDEF  
LORA_DEV_EUI=70B3D57ED005B420
LORA_REGION=EU868
BARREL_HEIGHT=120
BARREL_DIAMETER=80
MEASURE_INTERVAL=30
SAVE_CONFIG!
RESET!
```

### Operator order

1. Set value
2. Query key
3. Run action

### Set value

```plain
<KEY>=<VALUE>\n
^^^^^^^^^^^^^^^
  |  |   |    `- statement delimiter
  |  |   |
  |  |   `- value as a string (can't contain `=` and `\n`)
  |  `- delimiter
  `- key as a string (can't contain `=` and `\n`)
```

### Query key

```plain
<KEY>?\n
^^^^^^
   | `- Query this key
   `- Key to retrieve
```

### Run action

```plain
<ACTION>!\n
^^^^^^^^^
   |    `- Run this action
   `- Action to run
```
