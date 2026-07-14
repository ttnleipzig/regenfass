# Confetti

Full-screen confetti burst from the **center of the viewport** — best for occasional success or celebration, not for frequent UI feedback.

```tsx
import Confetti from '@/components/atoms/Confetti';

<Confetti active={true} />
```

Toggle `active` from parent state when you want the burst to appear. The overlay unmounts when `active` is false; it does not leave an empty box on the page.

## Props

| Name   | Type    | Default | Description |
|--------|---------|---------|--------------------------------------------------|
| active | boolean | false   | When true, shows the burst (fixed, full viewport) |

## Design notes

- **Layout:** `fixed inset-0` with a high z-index so the effect covers the whole screen; `pointer-events-none` keeps clicks and taps working underneath.
- **Motion:** Two beats — first a radial **burst** from the center (strong **ease-out**), then pieces **fall** in screen space while still tumbling. Only **transform + opacity** (GPU-friendly). Fall distance uses per-piece **`vh`** so confetti exits below the fold.
- **Reduced motion:** Under `prefers-reduced-motion: reduce`, flying motion is replaced by a short, subtle center fade so the moment still reads without heavy movement.
- **Accessibility:** The layer is `aria-hidden` and `role="presentation"` — it is purely decorative; use visible copy or toasts elsewhere for real status messages.
- **Palette:** Eight repeating colors (theme tokens plus a few brights) for variety across **48** particles.
