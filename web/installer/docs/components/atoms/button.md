# Button

Solid button styled with shadcn-solid tokens.

```tsx
import { Button } from '@/components/ui/button';

<Button>Primary</Button>
<Button variant='secondary'>Secondary</Button>
<Button variant='outline'>Outline</Button>
<Button variant='destructive'>Delete</Button>
```

## Props

| Name    | Type                    | Default       | Description                  |
| ------- | ----------------------- | ------------- | ---------------------------- | ----------- | --------- | ------------ | --------- | -------------------- |
| variant | 'default'               | 'destructive' | 'outline'                    | 'secondary' | 'ghost'   | 'link'       | 'default' | Visual style variant |
| size    | 'default'               | 'sm'          | 'lg'                         | 'icon'      | 'default' | Size variant |
| ...     | Kobalte ButtonRootProps | -             | All native button attributes |

## Design notes

- Built on Kobalte Button primitive for full accessibility support
- Uses CVA (Class Variance Authority) for type-safe variant management
- Includes focus-visible ring styling for keyboard navigation
- Hover and active states provide clear interaction feedback
- Icon size variant creates perfect square buttons for icon-only use cases
- Link variant appears as text with underline styling
- All variants use design system color tokens for theme consistency
