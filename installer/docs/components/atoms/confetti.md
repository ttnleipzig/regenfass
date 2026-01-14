# Confetti

Animated confetti effect component for celebratory moments.

```tsx
import Confetti from '@/components/atoms/Confetti';

<Confetti active={true} />
<Confetti active={false} />
```

## Props

| Name   | Type    | Default | Description                           |
|--------|---------|---------|---------------------------------------|
| active | boolean | false   | Whether to show the confetti animation|

## Design notes

- Creates a 192x192px (w-48 h-48) container for the confetti effect
- Shows 5 animated confetti pieces in different colors when active
- Each piece has a staggered animation delay for natural movement
- Uses Tailwind's `animate-bounce` for the confetti animation
- Colors include red, blue, green, yellow, and purple for variety
- Includes status text showing German "aktiv/inaktiv" state
- Positioned absolutely within the container for flexible placement
