# TextInput

```tsx
import { TextInput } from '@/components/forms/TextInput';

<TextInput label='Name' />
<TextInput label='Email' helperText='We never share your email.' />
<TextInput label='API Key' error='This field is required' />
```

## Props

| Name       | Type    | Default | Description                               |
|------------|---------|---------|-------------------------------------------|
| label      | string  | -       | Field label                               |
| required   | boolean | false   | Adds * marker                             |
| error      | string  | -       | Error text (passed to Input)              |
| helperText | string  | -       | Helper text                               |
| class      | string  | -       | Additional classes for input              |
| ...        | native input props | - | Forwarded to underlying input      |
