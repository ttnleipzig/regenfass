# OTP Field

This is the installer’s styled wrapper around [corvu’s OTP Field](https://corvu.dev/docs/otp-field) for SolidJS, following the [shadcn-solid OTP Field](https://shadcn-solid.com/docs/components/otp-field) pattern. It shows one character per box, with optional groups and separators.

## When to use it

Use it when a value is a **fixed length** and should feel easy to type or paste—like **16-character hexadecimal AppEUI and DevEUI** in the configuration step. The **AppKey** (32 hex characters) uses the separate [`AppKeyHexField`](../molecules/app-key-hex-field.md) with custom masking, not this OTP control.

## Import

```tsx
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
} from "@/components/ui/otp-field.tsx";
```

## Example (16 hex characters, eight pairs)

The configuration step uses the same layout for AppEUI and DevEUI: eight groups of two slots (2 + 2 + …) with no dash separator—only spacing between groups from the layout.

```tsx
<OTPField maxLength={16} value={devEUI} onValueChange={setDevEUI}>
  <OTPFieldInput pattern="^[0-9A-Fa-f]*$" autocomplete="off" />
  {/* eight OTPFieldGroups, each with two OTPFieldSlot indices */}
</OTPField>
```

## Building blocks

| Export | Role |
|--------|------|
| `OTPField` | Root: set `maxLength`, optional `value` / `onValueChange` / `onComplete` |
| `OTPFieldInput` | The real (visually hidden) input; set `pattern`, `id`, and `name` for labels and forms |
| `OTPFieldGroup` | Wraps a row of slots |
| `OTPFieldSeparator` | Visual break between groups |
| `OTPFieldSlot` | One cell; pass `index` from `0` to `maxLength - 1` |

## Accessibility

Pair the input with a visible label using `id` on `OTPFieldInput` and `for` on the label so screen readers and tests can find the control.

## Design notes

- Slots use the same semantic surface as our text inputs: `bg-background`, `border-input`, and `ring-offset-background` so they match the installer’s shadcn-style fields.
- Active slot uses the same ring treatment as focused inputs (`ring-2`, `ring-ring`, `ring-offset-2`); a blinking caret appears while typing.
- The root uses `flex-wrap` so grouped layouts stay usable on smaller screens.
