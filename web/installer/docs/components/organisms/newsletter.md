# Newsletter

Newsletter subscription section with gradient styling and responsive layout.

```tsx
import Newsletter from '@/components/organisms/Newsletter';

<Newsletter />
```

## Props

This component accepts no props - it provides a static newsletter subscription interface.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Uses responsive layout that stacks on mobile and arranges horizontally on larger screens
- Features gradient text styling for "update newsletters" consistent with brand colors
- Email input with placeholder text using IoT domain extension for theme relevance
- Custom rounded pill-style form with focus and hover ring effects
- Subscribe button uses gradient background matching site theme
- Includes proper form accessibility with input types and focus management
- Uses semantic `aside` element with newsletter ID for navigation
- Responsive typography and spacing for different screen sizes
- Focus and hover states provide clear interaction feedback
- Dark mode support with appropriate background colors
