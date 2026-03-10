# Flasher

ESP device flashing component using ESPTool-JS for firmware installation.

```tsx
import Flasher from '@/components/molecules/Flasher';

<Flasher />
```

## Props

This component accepts no props - it manages ESP device flashing internally.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Integrates ESPTool-JS for direct browser-based firmware flashing
- Manages device connection state and file selection internally
- Uses Web Serial API for direct device communication
- Provides user feedback through message display system
- Handles ESP device detection and chip identification
- Built with SolidJS reactive primitives for state management
- Implements proper error handling for device connection issues
- Streamlined UI with buttons for device operations and file management
