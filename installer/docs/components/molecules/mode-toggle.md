# Mode Toggle

Dark/light theme toggle button with smooth icon transitions.

```tsx
import { ModeToggle } from '@/components/ui/mode-toggle';

<ModeToggle />
```

## Props

This component accepts no props - it manages theme state internally.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Uses Kobalte's `useColorMode` hook for theme management
- Automatically persists theme choice to localStorage
- Features smooth icon transitions between sun and moon icons
- Icons rotate and scale during transitions for visual appeal
- Updates both Tailwind's `dark` class and Kobalte's `data-kb-theme` attribute
- Button uses ghost variant with icon size for minimal visual footprint
- Includes accessible aria-label for screen readers
- Gracefully handles localStorage errors in restrictive environments
- Transition duration is 300ms for smooth but quick feedback
