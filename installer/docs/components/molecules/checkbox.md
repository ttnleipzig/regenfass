# Checkbox

Form checkbox component with integrated FormField wrapper for consistent styling.

```tsx
import { Checkbox } from '@/components/forms/Checkbox';

<Checkbox label='Ich bin bereit' checked={false} />
<Checkbox label='Required field' required={true} />
<Checkbox label='With error' error='This field is required' />
<Checkbox label='With helper' helperText='Additional information' />
```

## Props

| Name       | Type                                     | Default | Description                                 |
|------------|------------------------------------------|---------|---------------------------------------------|
| label      | string                                   | -       | Label text displayed next to checkbox       |
| required   | boolean                                  | false   | Adds asterisk (*) to label                  |
| error      | string                                   | -       | Error state and text                        |
| helperText | string                                   | -       | Helper text below checkbox                  |
| class      | string                                   | -       | Additional CSS classes for wrapper          |
| id         | string                                   | -       | Checkbox ID (auto-generated if not provided)|
| ...        | JSX.InputHTMLAttributes<HTMLInputElement>| -       | All standard checkbox input attributes      |

## Design notes

- Built on top of FormField component for consistent form styling
- Automatically generates unique IDs when not provided for accessibility
- Error states change border and focus ring colors to red
- Uses flexbox layout with proper spacing between checkbox and label
- Checkbox styling follows design system with rounded corners and blue accent
- Label styling matches other form components for consistency
- Supports all native checkbox events and attributes (checked, onChange, etc.)
- FormField integration provides unified error and helper text display
