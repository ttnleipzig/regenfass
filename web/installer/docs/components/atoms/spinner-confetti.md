# SpinnerConfetti

Loading spinner with small confetti pieces that orbit the icon—meant for upbeat “almost done” moments without the busy bounce of the older version.

```tsx
import SpinnerConfetti from '@/components/atoms/SpinnerConfetti';

<SpinnerConfetti />
```

## Props

This component accepts no props — it is a fixed layout with a spinner and decorative confetti.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Center **Spinner** (Lucide loader) with a slightly shorter spin duration so the wait feels a bit snappier.
- Four confetti shards sit on **linear** orbit animations (different speeds and negative delays so they do not move in lockstep).
- Motion uses **transform-only** orbits for smooth, GPU-friendly animation.
- Under **`prefers-reduced-motion: reduce`**, orbits stop and shards stay at fixed positions; the spinner slows down for a calmer loop.
- Decorative ring uses **`aria-hidden="true"`** so screen readers only hear the spinner’s loading label.
- Outer frame stays **128×128px** (`w-32` / `h-32`) for consistent layout in installers and empty states.
