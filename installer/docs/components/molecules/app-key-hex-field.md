# AppKeyHexField

Friendly English summary for contributors: this is the **AppKey** editor used on the configuration step. It is **not** a native `type="password"` field.

## What it does

- Stores a **32-character hexadecimal** AppKey (same as before) and notifies the parent via `onCanonicalChange`.
- Shows **two hex digits at a time** with a **space** between pairs.
- While hidden, hex digits are shown as **bullet dots** (`•`) **per column** (same bordered cells as after reveal), not one long line.
- An **eye** button reveals the key with **vertical slot reels**—one column per hex pair—scrolling random values that **start fast and ease out** (like a fruit machine), then the real digits lock in. A short **success chime** plays at the end (Web Audio API; silent if audio is unavailable).
- After the animation, the key **stays in the same bordered columns** as the reels (one cell per pair). The real `<input>` stays on top with **transparent text** so focus, caret, and typing still work.

## Props

| Name | Type | Description |
|------|------|-------------|
| `id` | `string` | Passed to the real `<input>` (link with a `<label for=…>`). |
| `name` | `string` | `name` on the `<input>`. |
| `value` | `string` | Canonical hex only (no spaces), up to 32 chars. |
| `onCanonicalChange` | `(canonical: string) => void` | Called when the normalized hex value changes. |
| `class` | `string` | Optional extra classes on the outer wrapper. |

## Import

```tsx
import { AppKeyHexField } from "@/components/forms/AppKeyHexField.tsx";
```

## Design notes

- Uses `focus-within` on the wrapper so focus looks like other installer inputs.
- The mask layer is decorative (`aria-hidden`); screen readers still use the labeled text field.
