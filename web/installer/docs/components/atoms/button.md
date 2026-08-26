# Button

Solid button styled with shadcn-solid tokens.

```tsx
import { Button } from '@regenfass/brand';

<Button variant='primary'>Primary</Button>
<Button variant='secondary'>Secondary</Button>
<Button variant='outline'>Outline</Button>
<Button variant='destructive'>Delete</Button>
<Button variant='primary' loading={true}>Loading</Button>
<Button size='lg'>Large</Button>
```

## Props

| Name    | Type                                                                 | Default   | Description                              |
| ------- | -------------------------------------------------------------------- | --------- | ---------------------------------------- |
| variant | 'primary' \| 'secondary' \| 'default' \| 'destructive' \| 'outline' \| 'ghost' \| 'link' | 'default' | Visual style variant                     |
| size    | 'default' \| 'sm' \| 'lg' \| 'icon'                              | 'default' | Size variant                              |
| loading | boolean                                                              | false     | Shows spinner and disables the button    |
| ...     | Kobalte ButtonRootProps                                             | -         | All native button attributes             |

## Design notes

- Built on Kobalte Button primitive for full accessibility support
- Uses CVA (Class Variance Authority) for type-safe variant management
- Includes focus-visible ring styling for keyboard navigation
- Hover and active states provide clear interaction feedback
- Icon size variant creates perfect square buttons for icon-only use cases
- Link variant appears as text with underline styling
- Primary and secondary variants provide the shared brand action button styles
- Loading state shows an animated spinner and disables the button
- Large size uses a larger text size together with increased height and horizontal padding
- All variants use design system color tokens for theme consistency
