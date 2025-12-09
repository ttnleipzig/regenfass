# ButtonSecondary

Secondary action button with loading state support.

```tsx
import { ButtonSecondary } from '@/components/forms/ButtonSecondary';

<ButtonSecondary>Cancel</ButtonSecondary>
<ButtonSecondary loading={true}>Loading...</ButtonSecondary>
<ButtonSecondary disabled={true}>Disabled</ButtonSecondary>
```

## Props

| Name     | Type                                      | Default | Description                         |
|----------|-------------------------------------------|---------|-------------------------------------|
| loading  | boolean                                   | false   | Shows spinner and disables button  |
| class    | string                                    | -       | Additional CSS classes              |
| children | JSX.Element                               | -       | Button content                      |
| disabled | boolean                                   | false   | Disables the button                 |
| ...      | JSX.ButtonHTMLAttributes<HTMLButtonElement>| -      | All standard button attributes      |

## Design notes

- Built on the base Button component with outline variant
- Custom styling with gray border and text for secondary actions
- Loading state shows animated spinner icon with proper spacing
- Button is automatically disabled when loading is true
- Spinner uses gray-500 color to match secondary button styling
- Hover state provides subtle gray background feedback
- Loading spinner positioned with consistent spacing using Tailwind classes
- Maintains accessibility with proper disabled state handling
- Perfect for cancel, back, or other secondary actions in forms
