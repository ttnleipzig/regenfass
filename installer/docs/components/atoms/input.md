# Input

```tsx
import { Input } from '@/components/ui/input';

<Input label='Name' placeholder='Your name' />
<Input label='Email' type='email' required helperText='We never share your email.' />
<Input label='API Key' error='This field is required' />
```

## Props

| Name       | Type       | Default | Description                                 |
|------------|------------|---------|---------------------------------------------|
| label      | string     | -       | Optional label above input                   |
| error      | string     | -       | Shows error text and sets aria-invalid       |
| helperText | string     | -       | Helper text (hidden when error is present)   |
| ...        | native input props | - | All standard input attributes               |
