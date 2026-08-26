# Newsletter

Newsletter subscription section with gradient styling and a locale-aware Listmonk-backed form.

```tsx
import Newsletter from '@/components/organisms/Newsletter';

<Newsletter />
```

## Props

The optional `endpoint` prop is intended for local testing. Production uses the central
homepage Netlify Function, which stores the active `de` or `en` locale in Listmonk.

| Name     | Type   | Default             | Description                                          |
| -------- | ------ | ------------------- | ---------------------------------------------------- |
| endpoint | string | production function | Optional subscription endpoint for testing           |

## Design notes

- Uses responsive layout that stacks on mobile and arranges horizontally on larger screens
- Features gradient text styling for "update newsletters" consistent with brand colors
- Email input with placeholder text using IoT domain extension for theme relevance
- Only the required email input is shown
- Sends the active locale to the central subscription function
- Custom rounded pill-style form with focus and hover ring effects
- Subscribe button uses gradient background matching site theme
- Includes proper form accessibility with input types, labels, and focus management
- Uses semantic `aside` element with newsletter ID for navigation
- Responsive typography and spacing for different screen sizes
- Focus and hover states provide clear interaction feedback
- Dark mode support with appropriate background colors
