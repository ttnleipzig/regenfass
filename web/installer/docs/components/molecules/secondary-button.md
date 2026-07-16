# ButtonSecondary

Secondary action button with loading state support.

```tsx
import { ButtonSecondary } from '@/components/forms/ButtonSecondary';

<ButtonSecondary>Cancel</ButtonSecondary>
<ButtonSecondary loading={true}>Loading...</ButtonSecondary>
<ButtonSecondary disabled={true}>Disabled</ButtonSecondary>
```

## Props

| Name     | Type                                        | Default | Description                       |
| -------- | ------------------------------------------- | ------- | --------------------------------- |
| loading  | boolean                                     | false   | Shows spinner and disables button |
| class    | string                                      | -       | Additional CSS classes            |
| children | JSX.Element                                 | -       | Button content                    |
| disabled | boolean                                     | false   | Disables the button               |
| ...      | JSX.ButtonHTMLAttributes<HTMLButtonElement> | -       | All standard button attributes    |

## Design notes

- Built on the base Button component with outline variant
- Uses brand `secondary` tokens (teal border and label) for readable contrast in light and dark mode
- Loading state shows animated spinner icon with proper spacing
- Button is automatically disabled when loading is true
- Spinner uses `text-secondary` to match the outline label
- Hover state provides a light secondary tint (`hover:bg-secondary/10`)
- Loading spinner positioned with consistent spacing using Tailwind classes
- Maintains accessibility with proper disabled state handling
- Perfect for cancel, back, docs CTAs, or other secondary actions in forms
