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
