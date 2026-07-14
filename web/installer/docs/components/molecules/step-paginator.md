# StepPaginator

Shows a short numbered checklist inside a soft card. Use it when you want people to see **what happens in order**—for example before they plug in a device or start an install.

There are two looks:

- **Default** — steps stacked vertically with room to read each line. Best on the welcome or instruction screens.
- **Compact** — steps in a horizontal row that wraps on small screens. Handy when space is tight but the flow should stay visible.

You can optionally mark one step as **active** (for example the step someone is on right now). If you skip that, every step looks the same, which is fine for a simple “here is the order” list.

In the main installer flow, the app passes `activeStep` from the setup wizard: it uses `getInstallationActiveStep` (see `src/libs/install/installationActiveStep.ts`) to turn the current step of the state machine into a 1-based index, so the highlighted line always matches where someone is in connect → choose version → flash without hard-coding numbers in each screen.

```tsx
import { StepPaginator } from '@/components/molecules/StepPaginator';

<StepPaginator
  title="The installation steps are as follows:"
  steps={[
    'Connect your board with USB.',
    'Pick the board type.',
    'Click Install.',
  ]}
  listAriaLabel="Installation steps"
/>;

<StepPaginator
  variant="compact"
  steps={['Connect', 'Choose', 'Install']}
  activeStep={2}
/>;
```

## Props

| Name           | Type                         | Default   | Description |
|----------------|------------------------------|-----------|-------------|
| steps          | `readonly string[]`          | (required) | Labels in order; they appear as steps 1, 2, … |
| title          | `string`                     | —         | Optional line above the list |
| variant        | `"default" \| "compact"`     | `"default"` | Vertical list or compact horizontal layout |
| listAriaLabel  | `string`                     | `"Steps"` | Short name for screen readers on the list |
| class          | `string`                     | —         | Extra classes on the card wrapper |
| activeStep     | `number`                     | —         | Optional **1-based** index of the current step; styles that step more prominently |

## Design notes

- The card uses the same border and blur treatment as other installer panels so it feels consistent in light and dark mode.
- With `activeStep`, completed steps look muted and the current step uses the primary colour so progress is easy to scan.
