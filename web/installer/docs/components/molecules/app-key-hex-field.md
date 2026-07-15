# AppKeyHexField

Friendly English summary for contributors: this is the **AppKey** editor used on the configuration step. It is **not** a native `type="password"` field.

## What it does

- Stores a **32-character hexadecimal** AppKey (same as before) and notifies the parent via `onCanonicalChange`.
- Shows **two hex digits at a time** with a **space** between pairs.
- While hidden, hex digits are shown as **bullet dots** (`•`) **per column** (same bordered cells as after reveal), not one long line.
- An **eye** button reveals the key with **vertical reels**—one column per hex pair—like a **spinning wheel**: random values **move fast at first, then ease off**, each column **rolls slightly past** the final pair and **springs back** so the real digits align exactly. Near the end of the spin, **five high-pitched boxing-bell bings** with a little **reverb** play (slightly before the last column stops; Web Audio API; silent if audio is unavailable or sounds are muted in the header).
- Optional **copy** button (`showCopyButton`) copies the canonical AppKey as **uppercase hex** (32 characters, no spaces) to the clipboard and plays a short **camera shutter** sample (unless sounds are muted).
- Optional **reset** button (`showResetButton`) clears the field when it has a value; it also hides the key again if it was revealed.
- After the animation, the key **stays in the same bordered columns** as the reels (one cell per pair). The real `<input>` stays on top with **transparent text** so focus, caret, and typing still work.

## Props

| Name                | Type                          | Description                                                                                                                                                                 |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `string`                      | Passed to the real `<input>` (link with a `<label for=…>`).                                                                                                                 |
| `name`              | `string`                      | `name` on the `<input>`.                                                                                                                                                    |
| `value`             | `string`                      | Canonical hex only (no spaces), up to 32 chars.                                                                                                                             |
| `onCanonicalChange` | `(canonical: string) => void` | Called when the normalized hex value changes.                                                                                                                               |
| `class`             | `string`                      | Optional extra classes on the outer wrapper.                                                                                                                                |
| `showCopyButton`    | `boolean`                     | When true, shows a clipboard button beside the input (before the eye control). Copies uppercase hex. Disabled while empty or during the reveal animation.                   |
| `showResetButton`   | `boolean`                     | When true, shows a clear button beside the copy control when the field has a value. Clears the canonical hex and resets reveal state. Disabled during the reveal animation. |

## Import

```tsx
import { AppKeyHexField } from "@/components/forms/AppKeyHexField.tsx";
```

## Design notes

- Uses `focus-within` on the wrapper so focus looks like other installer inputs.
- The mask layer is decorative (`aria-hidden`); screen readers still use the labeled text field.
