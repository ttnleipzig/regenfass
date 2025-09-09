# Alert Dialog

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
