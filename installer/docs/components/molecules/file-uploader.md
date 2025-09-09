# FileUploader

File upload component with custom button styling and file list display.

```tsx
import { FileUploader } from '@/components/forms/FileUploader';

<FileUploader 
  label='Konfiguration importieren' 
  accept='.json'
  onFileSelect={(files) => console.log(files)} 
/>
<FileUploader 
  label='Upload images' 
  accept='image/*'
  multiple={true}
  helperText='Select one or more image files'
/>
```

## Props

| Name         | Type                              | Default | Description                               |
|--------------|-----------------------------------|---------|-------------------------------------------|
| label        | string                            | -       | Field label displayed above input         |
| required     | boolean                           | false   | Marks field as required with asterisk     |
| error        | string                            | -       | Error text (overrides helper text)       |
| helperText   | string                            | -       | Helper text shown below input             |
| accept       | string                            | -       | File type filter (e.g., '.json', 'image/*')|
| multiple     | boolean                           | false   | Allow selecting multiple files            |
| onFileSelect | (files: FileList \| null) => void | -       | Callback when file selection changes      |
| class        | string                            | -       | Additional CSS classes for wrapper        |
| ...          | JSX.InputHTMLAttributes           | -       | All standard file input attributes        |

## Design notes

- Built on FormField component for consistent form styling
- Uses hidden native file input with custom button interface
- "Datei auswählen" (Select File) button with outline variant styling
- Shows selected files with names and sizes in KB
- Includes "Löschen" (Clear) button when files are selected
- File size automatically calculated and displayed with 1 decimal precision
- Supports both single and multiple file selection
- Uses unique IDs for accessibility compliance
- German language interface elements but customizable via props
- FormField integration provides unified error and helper text handling
