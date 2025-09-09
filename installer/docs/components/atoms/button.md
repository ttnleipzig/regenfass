# Button

Solid button styled with shadcn-solid tokens.

```tsx
import { Button } from '@/components/ui/button';

<Button>Primary</Button>
<Button variant='secondary'>Secondary</Button>
<Button variant='outline'>Outline</Button>
<Button variant='destructive'>Delete</Button>
```

## Props

| Name    | Type                    | Default       | Description                  |
| ------- | ----------------------- | ------------- | ---------------------------- | ----------- | --------- | ------------ | --------- | -------------------- |
| variant | 'default'               | 'destructive' | 'outline'                    | 'secondary' | 'ghost'   | 'link'       | 'default' | Visual style variant |
| size    | 'default'               | 'sm'          | 'lg'                         | 'icon'      | 'default' | Size variant |
| ...     | Kobalte ButtonRootProps | -             | All native button attributes |
