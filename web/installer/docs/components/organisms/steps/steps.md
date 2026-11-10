# Steps

High-level installer flow component using XState for state management.

```tsx
import Steps from '@/components/molecules/steps/Steps';

<Steps />
```

## Props

This component accepts no props - it manages the installer state internally using XState.

| Name | Type | Default | Description        |
| ---- | ---- | ------- | ------------------ |
| -    | -    | -       | No props available |

## Design notes

- Central installer component that orchestrates the entire setup flow
- Built with XState for robust state management and clear flow logic
- Integrates multiple UI components including Alerts, Dialogs, and SelectField inputs
- Uses the Stately browser inspector only during local development (`pnpm dev`); it is not included in production builds
- Handles complex installer logic including device connection and configuration
- Provides user feedback through alert components for different states
- Manages form validation and error handling across installation steps
- Component composition allows for flexible step ordering and conditional flows

## Board, sensor, and firmware selection

Before flashing, choose the PlatformIO environment that matches your board and
sensor. The installer reads the environment names from `firmware/platformio.ini`
at build time. This includes the Heltec WiFi LoRa 32 V3, AZ-Delivery DevKit V4,
and IoT-PostBox v1 variants defined there.

The firmware version list contains only stable GitHub releases that publish
`regenfass-<tag>-<environment>.zip` for the selected environment. Changing the
environment clears the selected version. If no matching release is available,
the installer shows a message and prevents installation. It never substitutes
another board's firmware. Configuring an already installed device remains
available without selecting a firmware environment.

The setup state stores `firmwareReleases`, `targetEnvironment`, and
`targetFirmwareVersion`. The selection step sends `install.environment_selected`
and `install.target_version_selected`; the state machine verifies that the
combination exists before allowing `install.install`.

The release workflow derives both its build and upload matrices from the same
PlatformIO configuration. Each ZIP contains `firmware_metadata.json` and the
flash images referenced by that file. The installer validates and loads these
files before closing the serial port for flashing. Older archives without
metadata cannot be flashed through this flow.
