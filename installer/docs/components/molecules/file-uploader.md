# FileUploader

```tsx
import { FileUploader } from '@/components/forms/FileUploader';

<FileUploader label='Konfiguration importieren' accept='.json' />
```

## Props

| Name         | Type                      | Default | Description                               |
|--------------|---------------------------|---------|-------------------------------------------|
| label        | string                    | -       | Field label                                |
| required     | boolean                   | false   | Marks field as required                    |
| error        | string                    | -       | Error text                                 |
| helperText   | string                    | -       | Helper text                                |
| accept       | string                    | -       | Accept filter for file input               |
| multiple     | boolean                   | false   | Allow selecting multiple files             |
| onFileSelect | (files: FileList \| null) => void | - | Callback when files change                |
| class        | string                    | -       | Wrapper classes                            |
| ...          | native input props        | -       | All standard file input attributes         |
