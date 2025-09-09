# Headline

The Headline component displays a clear section title with optional subtitle and icon. It follows the shadcn-solid theming using CSS variables and adapts to dark mode automatically.

Usage:

```tsx
import { Headline } from "@/components/ui/headline";
import { IconAlertCircle } from "@tabler/icons-solidjs";

<Headline as="h2" subtitle="Configure your device">
  Configuration
</Headline>

<Headline as="h3" align="center" icon={<IconAlertCircle size={16} />}>
  Warning
</Headline>
```

Props:

- as: h1 | h2 | h3 | h4 (default: h2)
- align: left | center | right (default: left)
- subtitle: string (optional)
- icon: JSX.Element (optional)

Design notes:

- Font sizes are responsive and use `text-foreground` for contrast.
- Subtitle uses `text-muted-foreground`.
- Works with the existing Tailwind theme tokens.
