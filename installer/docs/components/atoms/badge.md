# Badge

Small status indicators with semantic color variants.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant='secondary'>Secondary</Badge>
<Badge variant='destructive'>Error</Badge>
<Badge variant='outline'>Outline</Badge>
```

## Props

| Name     | Type                                                    | Default   | Description                    |
|----------|---------------------------------------------------------|-----------|--------------------------------|
| variant  | 'default' \| 'secondary' \| 'destructive' \| 'outline' | 'default' | Visual style variant           |
| class    | string                                                  | -         | Additional CSS classes         |
| ...      | ComponentProps<"div">                                   | -         | All native div attributes      |

## Design notes

- Uses semantic color tokens that automatically adapt to light/dark themes
- Text size is fixed at `text-xs` for consistency across the design system
- Border radius follows the design system with `rounded-md`
- Hover states provide subtle interaction feedback
