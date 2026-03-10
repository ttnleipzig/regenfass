# Header

Main navigation header used at the top of the installer interface.

```tsx
import Header from '@/components/organisms/Header';

<Header />
```

## Props

This component accepts no props - it's a static header with fixed navigation links and branding.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Features the Regenfass brand name with gradient text styling
- Includes fixed navigation links to documentation, GitHub, and Matrix
- Navigation is hidden on mobile devices (`hidden md:block`)
- Integrates the ButtonModeToggle component for dark/light theme switching
- Uses responsive layout with max-width container and proper spacing
- Gradient text uses sky-600 to cyan-100 for brand recognition
