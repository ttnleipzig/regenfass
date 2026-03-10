# Regenfass Installer Documentation

## Overview

The Regenfass Installer is a web-based application built with SolidJS that provides a user-friendly interface for installing and configuring firmware on Regenfass IoT devices. The installer uses the Web Serial API to communicate directly with microcontrollers through the browser.

## Table of Contents

- [Architecture](#architecture)
- [Installation Flow](#installation-flow)
- [Components](#components)
- [State Management](#state-management)
- [Testing](#testing)
- [Development Setup](#development-setup)
- [Deployment](#deployment)

## Architecture

### Technology Stack

- **Frontend Framework**: SolidJS 1.9+
- **Build Tool**: Vite 7.1+
- **Styling**: TailwindCSS 3.4+
- **State Management**: XState 5.20+
- **Testing**: Vitest 3.2+ with SolidJS Testing Library
- **Package Manager**: pnpm 9+

### Project Structure

```
installer/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── forms/          # Form-specific components
│   ├── installer/          # Core installer logic
│   │   ├── forms/          # Step-specific form components
│   │   ├── libs/           # Utility libraries
│   │   └── types.ts        # TypeScript type definitions
│   ├── assets/             # Static assets
│   └── test/               # Legacy test files
├── tests/                  # New comprehensive test suite
├── docs/                   # Documentation
├── public/                 # Public assets
└── package.json
```

### Key Dependencies

- **@kobalte/core**: Accessible UI components
- **esptool-js**: Web-based ESP32/ESP8266 flashing tool
- **xstate**: State machine management
- **class-variance-authority**: Utility for creating variant-based component APIs
- **tailwind-merge**: Utility for merging Tailwind CSS classes

## Installation Flow

The installer follows a structured workflow managed by an XState state machine:

### 1. Start Phase
- **CheckingWebSerialSupport**: Verify browser compatibility
- **FetchUpstreamVersions**: Load available firmware versions from GitHub
- **WaitingForUser**: Present welcome screen and preparation instructions

### 2. Connect Phase
- **Connecting**: Establish serial connection with the device
- **ReadingVersion**: Read current firmware version from device

### 3. Install Phase
- **WaitingForInstallationMethodChoice**: User selects install or update
- **Installing**: Flash new firmware to blank device
- **Updating**: Update existing firmware
- **MigratingConfiguration**: Migrate settings between firmware versions

### 4. Config Phase
- **LoadingConfiguration**: Read current device configuration
- **Editing**: User edits LoRaWAN parameters
- **WritingConfiguration**: Write configuration to device

### 5. Finish Phase
- **ShowingNextSteps**: Display completion and next steps
- **ShowingError**: Handle and display errors with recovery options

## Components

### Core Components

#### InstallerRoot
Main application component that orchestrates the installation process.

**Props:**
- None (self-contained)

**Features:**
- State machine integration
- Error boundary handling
- Progress tracking

#### Form Components

Located in `src/installer/forms/`, these components handle specific installation steps:

- **StepStartWaitingForUserForm**: Welcome and preparation
- **StepConnectConnectingForm**: Device connection interface
- **StepInstallWaitingForInstallationMethodChoiceForm**: Installation method selection
- **StepConfigEditingForm**: LoRaWAN configuration editor
- **StepFinishShowingNextStepsForm**: Completion screen
- **StepFinishShowingErrorForm**: Error handling and recovery

#### UI Components

Located in `src/components/forms/`:

- **TextInput**: Enhanced text input with validation
- **Button**: Styled button component with variants
- **Select**: Dropdown selection component
- **Checkbox**: Checkbox with proper labeling
- **ErrorList**: Display validation errors
- **FileUpload**: File selection and upload handling

### Component Props

All form components follow a consistent interface:

```typescript
interface FormProps {
  send: (event: any) => void;
  // Additional props specific to each form
}
```

## State Management

The installer uses XState for predictable state management:

### State Machine Benefits

- **Predictable behavior**: Clear transitions between states
- **Error handling**: Built-in error states and recovery
- **Testing**: Deterministic state transitions
- **Debugging**: Visual state machine representation

### State Types

```typescript
type InstallerStateNames = 
  | "Start_CheckingWebSerialSupport"
  | "Start_FetchUpstreamVersions"
  | "Start_WaitingForUser"
  | "Connect_Connecting"
  | "Connect_ReadingVersion"
  | "Install_WaitingForInstallationMethodChoice"
  | "Install_Installing"
  | "Install_Updating"
  | "Install_MigratingConfiguration"
  | "Config_LoadingConfiguration"
  | "Config_Editing"
  | "Config_WritingConfiguration"
  | "Finish_ShowingNextSteps"
  | "Finish_ShowingError";
```

### Context Data

The state machine maintains context data throughout the installation:

```typescript
interface InstallerContext {
  upstreamVersions?: string[];
  selectedVersion?: string;
  deviceInfo?: DeviceInfo;
  configuration?: LoRaWANConfig;
  error?: string;
  progress?: number;
}
```

## Web Serial API Integration

The installer leverages the Web Serial API for direct device communication:

### Browser Support

- Chrome 89+
- Edge 89+
- Opera 76+
- **Not supported**: Firefox, Safari (as of 2024)

### Serial Communication

```typescript
// Request port access
const port = await navigator.serial.requestPort();

// Open connection
await port.open({ baudRate: 115200 });

// Read/write data
const reader = port.readable.getReader();
const writer = port.writable.getWriter();
```

### Error Handling

Common serial communication errors:

- `NetworkError`: Device disconnected
- `InvalidStateError`: Port already in use
- `NotFoundError`: No compatible device found
- `SecurityError`: Permission denied

## Configuration Management

### LoRaWAN Parameters

The installer manages the following LoRaWAN configuration:

```typescript
interface LoRaWANConfig {
  appEUI: string;    // 16-digit hex (8 bytes)
  appKey: string;    // 32-digit hex (16 bytes)  
  devEUI: string;    // 16-digit hex (8 bytes)
  firmwareVersion?: string;
  configVersion?: string;
}
```

### Validation Rules

- **AppEUI**: Must be exactly 16 hexadecimal characters
- **AppKey**: Must be exactly 32 hexadecimal characters  
- **DevEUI**: Must be exactly 16 hexadecimal characters
- **Case insensitive**: Accepts both uppercase and lowercase hex

### Import/Export

Configuration can be exported to and imported from JSON files:

```json
{
  "appEUI": "0000000000000000",
  "appKey": "00000000000000000000000000000000",
  "devEUI": "0000000000000000",
  "firmwareVersion": "1.0.0",
  "configVersion": "1.0"
}
```

## Error Handling

### Error Categories

1. **Browser Compatibility**: Web Serial API not supported
2. **Device Connection**: Serial port access issues
3. **Firmware**: Invalid or corrupted firmware files
4. **Configuration**: Invalid LoRaWAN parameters
5. **Network**: GitHub API rate limiting or connectivity issues

### Error Recovery

- **Automatic retry**: For transient network errors
- **User guidance**: Clear instructions for manual recovery
- **State persistence**: Maintain progress through errors
- **Reset option**: Allow users to start over

### Error Messages

All error messages are localized in German and provide:

- Clear problem description
- Specific recovery steps
- Technical details (when helpful)
- Contact information for support

## Performance Considerations

### Memory Management

- Stream large firmware files to avoid memory issues
- Clean up serial connections properly
- Use efficient data structures for configuration

### User Experience

- Progress indicators for long operations
- Non-blocking UI during background tasks
- Responsive design for various screen sizes
- Keyboard navigation support

### Network Optimization

- Cache firmware versions locally
- Implement request debouncing
- Handle GitHub API rate limits gracefully

## Security Considerations

### Data Handling

- No sensitive data stored in browser storage
- Configuration exported only on user request
- Serial communication over secure context (HTTPS)

### Input Validation

- Strict validation of all user inputs
- Sanitization of file uploads
- Protection against injection attacks

### Device Security

- Read-only access to device information
- Secure firmware verification
- Protection against malicious firmware