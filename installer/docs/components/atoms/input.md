# InputField

```tsx
import { InputField } from '@/components/ui/input';

<InputField label='Name' placeholder='Your name' />
<InputField label='Email' type='email' required helperText='We never share your email.' />
<InputField label='API Key' error='This field is required' />
```

## Props

| Name       | Type       | Default | Description                                 |
|------------|------------|---------|---------------------------------------------|
| label      | string     | -       | Optional label above input                   |
| error      | string     | -       | Shows error text and sets aria-invalid       |
| helperText | string     | -       | Helper text (hidden when error is present)   |
| ...        | native input props | - | All standard input attributes               |

## Design notes

- Combines input field with label, error, and helper text in a unified component
- Error states change border color and focus ring to red for clear indication
- Auto-generates unique IDs when not provided for accessibility compliance
- Helper text is automatically hidden when error text is present
- Uses design system spacing and typography for consistency
- Full width by default with proper ring-offset styling for focus states
- File input styling accommodates all native input types seamlessly
