# FormLayout

Structured form container with title, subtitle, and action sections.

```tsx
import { FormLayout } from '@/components/forms/FormLayout';

<FormLayout title='LoRaWAN Konfiguration' subtitle='Konfigurieren Sie die Parameter'>
  {/* fields and actions */}
</FormLayout>
```

## Props

| Name     | Type                                   | Default | Description                               |
|----------|----------------------------------------|---------|-------------------------------------------|
| title    | string                                 | -       | Form title (uses Headline component)     |
| subtitle | string                                 | -       | Subtitle text below title                |
| actions  | JSX.Element                            | -       | Action buttons section                    |
| class    | string                                 | -       | Additional CSS classes                    |
| children | JSX.Element                            | -       | Form fields content                       |
| ...      | JSX.FormHTMLAttributes<HTMLFormElement>| -       | All native form attributes                |

## Design notes

- Provides consistent structure for all form layouts in the application
- Uses Headline component for title with integrated subtitle support  
- Automatic spacing between title, content, and action sections
- Actions section positioned at bottom with proper spacing
- Responsive spacing system using design tokens
- Semantic form element with proper hierarchy
- Title and subtitle can be used independently or together
- Flexible children prop allows any form content arrangement
