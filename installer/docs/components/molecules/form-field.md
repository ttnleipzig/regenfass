# FormField

```tsx
import { FormField } from "@/components/forms/FormField";

<FormField label="Email" helperText="We never share your email.">
	<input type="email" class="w-full" />
</FormField>;
```

## Props

| Name       | Type    | Default | Description                                   |
|------------|---------|---------|-----------------------------------------------|
| label      | string  | -       | Field label                                   |
| required   | boolean | false   | Shows * marker next to the label              |
| error      | string  | -       | Error text (role=alert), hides helperText     |
| helperText | string  | -       | Helper text shown when no error               |
| class      | string  | -       | Additional classes                            |
| children   | JSX.Element | -   | The form control inside the field             |

## Design notes

- Provides consistent field layout structure for all form inputs
- Required indicator uses red asterisk with proper spacing
- Error text includes role="alert" for screen reader accessibility
- Helper text automatically hides when error is present to avoid confusion
- Uses semantic spacing with design system tokens
- Labels use appropriate font weight and color for hierarchy
- Error and helper text use smaller font size for visual hierarchy
- Flexible children prop allows any form control to be wrapped
