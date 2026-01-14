# AlertInline

```tsx
import { AlertInline, AlertTitle, AlertDescription } from '@/components/ui/alert';

<AlertInline variant='info'>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Useful information for the user.</AlertDescription>
</AlertInline>

<AlertInline variant='warning'>
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please check your input.</AlertDescription>
</AlertInline>

<AlertInline variant='destructive'>
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</AlertInline>
```

## Props

| Name     | Type                                                | Default     | Description               |
|----------|-----------------------------------------------------|-------------|---------------------------|
| variant  | `'default'`, `'info'`, `'warning'`, `'destructive'` | `'default'` | Color/intent variant      |
| showIcon | boolean                                             | true        | Show matching intent icon |
| class    | string                                              | -           | Additional classes        |
| children | ReactNode (use Title/Description)                   | -           | Content inside the alert  |

## Design notes

- Built on Kobalte AlertInline primitive for accessibility compliance
- Each variant has semantic colors with appropriate background and border styling
- Icons automatically match the variant (info: circle, warning: triangle, error: X)
- Uses backdrop blur effect with semi-transparent backgrounds for modern appearance
- Icon positioning is handled automatically with proper spacing
- AlertTitle and AlertDescription components provide structured content layout
- Supports all Kobalte alert features including ARIA attributes
