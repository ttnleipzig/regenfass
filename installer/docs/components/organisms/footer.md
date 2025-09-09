# Footer

Site footer with navigation links, contact information, and credits.

```tsx
import Footer from '@/components/organisms/Footer';

<Footer />
```

## Props

This component accepts no props - it displays static footer information.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | No props available |

## Design notes

- Responsive design with mobile-specific navigation (hidden on desktop)
- Mobile navigation includes icons from Tabler Icons for better UX
- Links include Docs, GitHub, and Matrix community channels
- Contains TTN Leipzig contact address information
- Credits ESP Web Tools as the underlying technology
- Uses consistent hover states with color transitions
- Follows responsive breakpoints (md:hidden for mobile nav)
- Border top provides visual separation from main content
