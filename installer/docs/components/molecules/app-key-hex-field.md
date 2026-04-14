# AppKeyHexField

Friendly English summary for contributors: this is the **AppKey** editor used on the configuration step. It is **not** a native `type="password"` field.

## What it does

- Stores a **32-character hexadecimal** AppKey (same as before) and notifies the parent via `onCanonicalChange`.
- Shows **two hex digits at a time** with a **space** between pairs.
- While hidden, hex digits are shown as **bullet dots** (`•`) in the same layout, so spacing matches the reference design.
- An **eye** button toggles between masked and **plain hex** (for checking what you typed).

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
