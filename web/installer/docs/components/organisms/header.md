# Header

Main navigation header used at the top of installer and other Regenfass web UIs (from `@regenfass/brand`).

```tsx
import { Header, type HeaderNavItem } from "@regenfass/brand";

const navItems: HeaderNavItem[] = [
  { href: "/", label: "Home" },
  {
    href: "https://docs.regenfass.eu/",
    label: "Docs",
    external: true,
    onClick: () => {
      /* optional analytics / side effects */
    },
  },
];

<Header title="Regenfass" navItems={navItems} />
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Regenfass"` | Optional brand title shown in the header. |
| `navItems` | `HeaderNavItem[]` | Docs / installer / GitHub / Matrix defaults | Navigation items. |
| `trailing` | `JSX.Element` | — | Extra controls rendered next to the color-mode toggle. |

### `HeaderNavItem`

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | required | Link target. |
| `label` | `string` | required | Visible label. |
| `external` | `boolean` | inferred from `http(s)` | Force external `<a>`/`Link` instead of router `<A>`. |
| `onClick` | `(e) => void` | — | Optional click handler (for example analytics before navigate). |

## Design notes

- Features the Regenfass brand name with gradient text styling
- Navigation is hidden on mobile devices (`hidden md:block`)
- Integrates the ButtonModeToggle component for dark/light theme switching
- Uses responsive layout with max-width container and proper spacing
- Gradient text uses sky-600 to cyan-100 for brand recognition
