# Progress

Determinate progress bar built on [Kobalte Progress](https://kobalte.dev/docs/core/components/progress), styled like shadcn-solid. Use it for **0–100** values (for example firmware or configuration progress).

## Import

```tsx
import { Progress } from "@/components/atoms/Progress.tsx";
```

## Example

```tsx
<Progress value={60} />
```

## Props

Accepts Kobalte `Progress` root props plus optional `class`. When `indeterminate` is not set, drive completion with `value` from 0 to 100.
