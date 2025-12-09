# SelectField

Dropdown selection component built on Kobalte with multiple sub-components for flexible composition.

```tsx
import {
  SelectField,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

<SelectField>
  <SelectTrigger>
    <SelectValue placeholder="SelectField option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</SelectField>
```

## Props

### SelectField
Root select component - inherits all Kobalte SelectField props.

| Name        | Type                    | Default | Description                           |
|-------------|-------------------------|---------|---------------------------------------|
| value       | string                  | -       | Current selected value                |
| onValueChange | (value: string) => void | -      | Callback when selection changes       |
| disabled    | boolean                 | false   | Disable the select                    |
| ...         | Kobalte SelectProps     | -       | All Kobalte select root props         |

### SelectTrigger

| Name     | Type                      | Default | Description                     |
|----------|---------------------------|---------|---------------------------------|
| class    | string                    | -       | Additional CSS classes          |
| children | JSX.Element               | -       | Trigger content                 |
| ...      | Kobalte SelectTriggerProps| -       | All Kobalte trigger props       |

### SelectContent

| Name     | Type                      | Default | Description                     |
|----------|---------------------------|---------|---------------------------------|
| class    | string                    | -       | Additional CSS classes          |
| ...      | Kobalte SelectContentProps| -       | All Kobalte content props       |

### SelectItem

| Name     | Type                    | Default | Description                     |
|----------|-------------------------|---------|---------------------------------|
| value    | string                  | -       | Item value                      |
| class    | string                  | -       | Additional CSS classes          |
| children | JSX.Element             | -       | Item label content              |
| ...      | Kobalte SelectItemProps | -       | All Kobalte item props          |

### SelectValue

Displays the current selection - inherits all Kobalte SelectValue props.

### Additional Components

- `SelectDescription`: For helper text
- `SelectErrorMessage`: For error states
- `SelectItemDescription`: For item descriptions
- `SelectHiddenSelect`: Hidden native select for form integration
- `SelectSection`: For grouping items

## Design notes

- Built on Kobalte primitives for full accessibility support
- Trigger includes dropdown arrow icon and focus states
- Content appears in a portal with smooth animations
- Selected items show checkmark indicator
- Follows design system spacing and color tokens
- Supports keyboard navigation and screen readers
