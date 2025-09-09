# Checkbox

```tsx
import Checkbox from '@/components/forms/Checkbox';

<Checkbox label='Ich bin bereit' checked={false} />
```

## Props

| Name       | Type    | Default | Description                                 |
|------------|---------|---------|---------------------------------------------|
| label      | string  | -       | Label text                                  |
| required   | boolean | false   | Adds * to label                             |
| error      | string  | -       | Error state and text                        |
| helperText | string  | -       | Helper text below                           |
| class      | string  | -       | Wrapper classes                             |
| ...        | native input props | - | All standard checkbox attributes     |
