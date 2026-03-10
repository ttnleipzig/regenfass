# TextInput

Text input component built on InputField with integrated FormField wrapper.

```tsx
import { TextInput } from '@/components/forms/TextInput';

<TextInput label='Name' placeholder='Enter your name' />
<TextInput label='Email' type='email' helperText='We never share your email.' />
<TextInput label='API Key' error='This field is required' />
<TextInput label='Required field' required={true} />
```

## Props

| Name       | Type                                     | Default | Description                               |
|------------|------------------------------------------|---------|-------------------------------------------|
| label      | string                                   | -       | Field label displayed above input         |
| required   | boolean                                  | false   | Adds asterisk (*) marker to label        |
| error      | string                                   | -       | Error text (passed to both FormField and InputField)|
| helperText | string                                   | -       | Helper text shown below input             |
| class      | string                                   | -       | Additional CSS classes for input element  |
| ...        | JSX.InputHTMLAttributes<HTMLInputElement>| -       | All native input attributes forwarded     |

## Design notes

- Combines FormField and InputField components for complete form input solution
- Automatically sets full width (`w-full`) for consistent form layouts
- Error prop is passed to both FormField (for display) and InputField (for styling)
- Built on the atomic InputField component while providing molecule-level functionality
- FormField integration ensures consistent labeling, error display, and helper text
- Supports all standard input types (text, email, password, etc.)
- Maintains design system consistency across all form inputs
- InputField component handles its own styling for error states and focus management
