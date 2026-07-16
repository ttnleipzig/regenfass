# ErrorList

Display multiple form errors in a visually distinct alert box.

```tsx
import { ErrorList } from '@/components/forms/ErrorList';

<ErrorList title='Errors' errors={['AppKey is empty', 'DevEUI is invalid']} />
<ErrorList errors={['Single error message']} />
<ErrorList title='Validation Issues' errors={[]} /> {/* Renders nothing */}
```

## Props

| Name   | Type                               | Default | Description                                               |
| ------ | ---------------------------------- | ------- | --------------------------------------------------------- |
| errors | string[]                           | []      | Array of error messages to display                        |
| title  | string                             | locale  | Title text; defaults via brand i18n (`Errors` / `Fehler`) |
| class  | string                             | -       | Additional CSS classes                                    |
| ...    | JSX.HTMLAttributes\<HTMLDivElement\> | -     | All native div attributes                                 |

## Design notes

- Automatically hides when errors array is empty (renders null)
- Uses semantic red color scheme for error indication
- Includes accessible role="alert" for screen readers
- Features an error icon (X in circle) for immediate visual recognition
- Error messages displayed as bulleted list for easy scanning
- Red background with border creates clear visual separation
- Default title follows the active locale from `LocaleProvider`
- Consistent spacing and typography with other form components
- Icon uses currentColor for automatic color inheritance
