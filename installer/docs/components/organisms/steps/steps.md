# Steps

High-level installer flow component using XState for state management.

```tsx
import Steps from '@/components/molecules/steps/Steps';

<Steps />
```

## Props

This component accepts no props - it manages the installer state internally using XState.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Central installer component that orchestrates the entire setup flow
- Built with XState for robust state management and clear flow logic
- Integrates multiple UI components including Alerts, Dialogs, and SelectField inputs
- Uses browser inspector for development debugging of state transitions
- Handles complex installer logic including device connection and configuration
- Provides user feedback through alert components for different states
- Manages form validation and error handling across installation steps
- Component composition allows for flexible step ordering and conditional flows
