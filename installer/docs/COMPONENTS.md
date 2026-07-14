# Components Documentation

This document contains automatically generated documentation for all components in the installer application.

> **Note**: This file is auto-generated. Do not edit manually.

## Table of Contents

- [Atoms](#atoms)
  - [ButtonAction](#buttonaction)
  - [ButtonPrimary](#buttonprimary)
  - [ButtonSecondary](#buttonsecondary)
  - [Confetti](#confetti)
  - [Link](#link)
  - [SpinnerConfetti](#spinnerconfetti)
  - [Status](#status)
- [Molecules](#molecules)
  - [CardTitle](#cardtitle)
  - [CardDescription](#carddescription)
  - [ErrorList](#errorlist)
  - [SensorGraph](#sensorgraph)
- [Organisms](#organisms)
  - [Header](#header)
- [Forms](#forms)
  - [AppKeyHexField](#appkeyhexfield)
  - [Checkbox](#checkbox)
  - [FileUploader](#fileuploader)
  - [FormField](#formfield)
  - [FormLayout](#formlayout)
  - [InputField](#inputfield)
  - [TextInput](#textinput)
- [Uncategorized](#uncategorized)
  - [Dashboard](#dashboard)
  - [LeipzigMap](#leipzigmap)

## Atoms

### ButtonAction

**Path**: `atoms/ButtonAction.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

**Import:**

```typescript
import { ButtonAction } from '@/components/atoms/ButtonAction';
```

### ButtonPrimary

**Path**: `atoms/ButtonPrimary.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

**Import:**

```typescript
import { ButtonPrimary } from '@/components/atoms/ButtonPrimary';
```

### ButtonSecondary

**Path**: `atoms/ButtonSecondary.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

**Import:**

```typescript
import { ButtonSecondary } from '@/components/atoms/ButtonSecondary';
```

### Confetti

**Path**: `atoms/Confetti.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

*Internal:*

- `atoms/Confetti.css`

**Import:**

```typescript
import { Confetti } from '@/components/atoms/Confetti';
```

### Link

**Path**: `atoms/Link.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

**Import:**

```typescript
import { Link } from '@/components/atoms/Link';
```

### SpinnerConfetti

**Path**: `atoms/SpinnerConfetti.tsx`

**Dependencies:**

*External:*

- `solid-js`

*Internal:*

- `atoms/Spinner`
- `atoms/SpinnerConfetti.css`

**Import:**

```typescript
import { SpinnerConfetti } from '@/components/atoms/SpinnerConfetti';
```

### Status

**Path**: `atoms/Status.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

*Internal:*

- `atoms/Spinner`

**Import:**

```typescript
import { Status } from '@/components/atoms/Status';
```

## Molecules

### CardDescription

**Path**: `molecules/Card.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

**Import:**

```typescript
import { CardDescription } from '@/components/molecules/Card';
```

### CardTitle

**Path**: `molecules/Card.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

**Import:**

```typescript
import { CardTitle } from '@/components/molecules/Card';
```

### ErrorList

**Path**: `molecules/ErrorList.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `lucide-solid`
- `solid-js`

**Import:**

```typescript
import { ErrorList } from '@/components/molecules/ErrorList';
```

### SensorGraph

**Path**: `molecules/SensorGraph.tsx`

**Dependencies:**

*External:*

- `apexcharts`
- `lucide-solid`
- `solid-apexcharts`
- `solid-js`

**Import:**

```typescript
import { SensorGraph } from '@/components/molecules/SensorGraph';
```

## Organisms

### Header

**Path**: `organisms/Header.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `@solidjs/router`
- `solid-js`

*Internal:*

- `atoms/ButtonModeToggle`
- `atoms/Link`

**Import:**

```typescript
import { Header } from '@/components/organisms/Header';
```

## Forms

### AppKeyHexField

**Path**: `forms/AppKeyHexField.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `lucide-solid`
- `solid-js`

**Import:**

```typescript
import { AppKeyHexField } from '@/components/forms/AppKeyHexField';
```

### Checkbox

**Path**: `forms/Checkbox.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

*Internal:*

- `forms/FormField`

**Import:**

```typescript
import { Checkbox } from '@/components/forms/Checkbox';
```

### FileUploader

**Path**: `forms/FileUploader.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

*Internal:*

- `forms/FormField`

**Import:**

```typescript
import { FileUploader } from '@/components/forms/FileUploader';
```

### FormField

**Path**: `forms/FormField.tsx`

**Dependencies:**

*External:*

- `@/libs`
- `solid-js`

**Import:**

```typescript
import { FormField } from '@/components/forms/FormField';
```

### FormLayout

**Path**: `forms/FormLayout.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

**Import:**

```typescript
import { FormLayout } from '@/components/forms/FormLayout';
```

### InputField

**Path**: `forms/InputField.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

**Import:**

```typescript
import { InputField } from '@/components/forms/InputField';
```

### TextInput

**Path**: `forms/TextInput.tsx`

**Dependencies:**

*External:*

- `@/components`
- `@/libs`
- `solid-js`

*Internal:*

- `forms/FormField`

**Import:**

```typescript
import { TextInput } from '@/components/forms/TextInput';
```

## Uncategorized

### Dashboard

**Path**: `pages/Dashboard.tsx`

**Dependencies:**

*External:*

- `@solidjs/router`
- `lucide-solid`
- `solid-js`

*Internal:*

- `molecules/SensorGraph`
- `pages/LeipzigMap`
- `ui/select`
- `ui/text-input`

**Import:**

```typescript
import { Dashboard } from '@/components/pages/Dashboard';
```

### LeipzigMap

**Path**: `pages/LeipzigMap.tsx`

**Dependencies:**

*External:*

- `@protomaps/basemaps`
- `maplibre-gl`
- `solid-js`
- `solid-maplibre`

**Import:**

```typescript
import { LeipzigMap } from '@/components/pages/LeipzigMap';
```

---

*Generated on July 14, 2026 at 06:17 PM*
