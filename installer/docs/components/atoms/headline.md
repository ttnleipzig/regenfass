# Headline

The Headline component displays a clear section title with optional subtitle and icon. It follows the shadcn-solid theming using CSS variables and adapts to dark mode automatically.

Usage:

```tsx
import { Headline } from '@/components/ui/headline';

<Headline as='h2' subtitle='Configure your device'>Configuration</Headline>
<Headline as='h3' align='center'>Centered</Headline>
```

## Props

| Name     | Type                            | Default  | Description            |
|----------|---------------------------------|----------|------------------------|
| as       | `'h1'`, `'h2'`, `'h3'`, `'h4'`  | `'h2'`   | Heading level          |
| align    | `'left'`, `'center'`, `'right'` | `'left'` | Text alignment         |
| subtitle | string                          | -        | Optional subtitle line |
| icon     | JSX.Element                     | -        | Optional leading icon  |
| class    | string                          | -        | Additional classes     |
| children | JSX.Element                     | -        | Title content          |

## Design notes

- Font sizes are responsive and use `
