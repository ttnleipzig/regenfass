# Card

Flexible container component with multiple sub-components for structured content layout.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card class='p-4'>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

## Props

### Card

| Name     | Type                    | Default | Description                  |
|----------|-------------------------|---------|------------------------------|
| class    | string                  | -       | Additional CSS classes       |
| ...      | ComponentProps<"div">   | -       | All native div attributes    |

### CardHeader

| Name     | Type                    | Default | Description                  |
|----------|-------------------------|---------|------------------------------|
| class    | string                  | -       | Additional CSS classes       |
| ...      | ComponentProps<"div">   | -       | All native div attributes    |

### CardTitle

| Name     | Type                    | Default | Description                  |
|----------|-------------------------|---------|------------------------------|
| class    | string                  | -       | Additional CSS classes       |
| ...      | ComponentProps<"h1">    | -       | All native h1 attributes     |

### CardDescription

| Name     | Type                    | Default | Description                  |
|----------|-------------------------|---------|------------------------------|
| class    | string                  | -       | Additional CSS classes       |
| ...      | ComponentProps<"h3">    | -       | All native h3 attributes     |

### CardContent

| Name     | Type                    | Default | Description                  |
|----------|-------------------------|---------|------------------------------|
| class    | string                  | -       | Additional CSS classes       |
| ...      | ComponentProps<"div">   | -       | All native div attributes    |

### CardFooter

| Name     | Type                    | Default | Description                  |
|----------|-------------------------|---------|------------------------------|
| class    | string                  | -       | Additional CSS classes       |
| ...      | ComponentProps<"div">   | -       | All native div attributes    |

## Design notes

- Cards provide visual hierarchy with subtle shadows and borders
- Background uses semantic card tokens for theme consistency
- Border radius follows design system standards with `rounded-xl`
- Header, content, and footer sections have standardized padding
- Content sections use `pt-0` to avoid double spacing with header
