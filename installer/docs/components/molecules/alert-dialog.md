# AlertInline Dialog

```tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction>OK</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

## Props (key parts)

| Component               | Notable props     | Description                       |
|------------------------|-------------------|-----------------------------------|
| AlertDialog             | —                 | Root provider                     |
| AlertDialogContent      | class?            | Dialog surface container          |
| AlertDialogHeader       | —                 | Header layout                     |
| AlertDialogFooter       | —                 | Footer layout                     |
| AlertDialogTitle        | class?            | Title text                        |
| AlertDialogDescription  | class?            | Secondary text                    |
| AlertDialogAction       | class?            | Action button (closes by default) |

## Design notes

- Built on Kobalte Dialog primitives for complete accessibility compliance
- Modal dialog with backdrop overlay and focus management
- Content surface uses design system spacing and styling
- Header and footer sections provide structured layout
- Action button automatically closes dialog when clicked
- Supports all ARIA dialog patterns including escape key handling
- Uses portal rendering for proper z-index layering
- Title and description support custom styling while maintaining semantic structure
