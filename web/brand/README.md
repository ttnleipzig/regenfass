# @regenfass/brand

![Regenfass Brand](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-regenfass-brand.svg)

Shared SolidJS UI, theme tokens, and Tailwind preset for Regenfass web apps.

## What it provides

- Reusable SolidJS components for the Regenfass web applications
- Shared colors, typography, spacing, and dark-mode styles
- A Tailwind CSS preset for consistent application styling
- Shared navigation, layout, forms, and newsletter components

## Usage

```ts
import { Button, Header, cn } from "@regenfass/brand";
import "@regenfass/brand/styles.css";
```

In Tailwind configs:

```js
import brandPreset from "@regenfass/brand/tailwind.preset.cjs";

export default {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../brand/src/**/*.{ts,tsx}"],
};
```

See `web/playground` for the interactive component gallery (`pnpm dev:playground`).

## Development

Install dependencies from the repository root:

```bash
pnpm install
```

Type-check the package with:

```bash
pnpm --filter @regenfass/brand exec tsc --noEmit
```

The package is consumed through the workspace and does not run a standalone development server.

## Related projects

- [Component playground](../playground/README.md)
- [Installer](../installer/README.md)
- [Repository documentation](../../docs/Home.md)
