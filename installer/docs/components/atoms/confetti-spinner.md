# ConfettiSpinner

Loading spinner with animated confetti elements for celebratory loading states.

```tsx
import ConfettiSpinner from '@/components/atoms/ConfettiSpinner';

<ConfettiSpinner />
```

## Props

This component accepts no props - it's a static spinner with confetti animation.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Combines a traditional loading spinner with festive confetti elements
- Central spinner uses blue accent with gray border and `animate-spin`
- Four confetti pieces positioned around the spinner with staggered delays
- Each confetti piece uses different colors (red, blue, green, yellow)
- Container is 128x128px (w-32 h-32) with centered content
- Perfect for success states or celebratory loading scenarios
- Uses `animate-bounce` for confetti movement with varying delays
