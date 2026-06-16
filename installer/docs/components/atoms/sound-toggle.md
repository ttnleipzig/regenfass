# Sound Toggle

Mute button for installer UI sounds (for example the slot-machine dings when revealing an AppKey).

```tsx
import { ButtonSoundToggle } from "@/components/atoms/ButtonSoundToggle.tsx";

<ButtonSoundToggle />
```

## Props

This component accepts no props — it reads and updates the global sound preference.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- **Sounds are on by default.**
- Toggling updates `localStorage` (`regenfass-sound-enabled`) so the choice survives reloads.
- Uses **solid-icons** volume icons: full when sounds are on, muted when off.
- Placed in the header next to the dark/light mode toggle.
- `aria-pressed` is `true` when sounds are muted.
- All Web Audio effects (for example AppKey reel dings) respect this preference.
