# Link

Smart link component that automatically handles external links with proper security attributes.

```tsx
import Link from '@/components/atoms/Link';

<Link href='https://example.com'>External link</Link>
<Link href='/internal-page'>Internal link</Link>
```

## Props

| Name     | Type        | Default | Description                           |
|----------|-------------|---------|---------------------------------------|
| href     | string      | -       | Link destination URL                  |
| children | JSX.Element | -       | Link content                          |

## Design notes

- Automatically detects external links (starting with 'http') and adds `target="_blank"` and security attributes
- Uses blue color scheme with hover states for accessibility
- External links include `rel="noopener noreferrer"` for security
- Underlined by default for clear link indication
- Color follows standard web conventions (blue-600 base, blue-800 hover)
