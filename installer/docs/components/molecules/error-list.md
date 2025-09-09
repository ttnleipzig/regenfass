# ErrorList

Display multiple form errors in a visually distinct alert box.

```tsx
import { ErrorList } from '@/components/forms/ErrorList';

<ErrorList title='Fehler' errors={['AppKey ist leer', 'DevEUI ist ungültig']} />
<ErrorList errors={['Single error message']} />
<ErrorList title='Validation Issues' errors={[]} /> {/* Renders nothing */}
```

## Props

| Name     | Type                              | Default   | Description                              |
|----------|-----------------------------------|-----------|------------------------------------------|
| errors   | string[]                          | []        | Array of error messages to display       |
| title    | string                            | "Fehler"  | Title text for the error section         |
| class    | string                            | -         | Additional CSS classes                   |
| ...      | JSX.HTMLAttributes<HTMLDivElement>| -         | All native div attributes                |

## Design notes

- Automatically hides when errors array is empty (renders null)
- Uses semantic red color scheme for error indication
- Includes accessible role="alert" for screen readers  
- Features an error icon (X in circle) for immediate visual recognition
- Error messages displayed as bulleted list for easy scanning
- Red background with border creates clear visual separation
- Default title in German ("Fehler") but easily customizable
- Consistent spacing and typography with other form components
- Icon uses currentColor for automatic color inheritance
