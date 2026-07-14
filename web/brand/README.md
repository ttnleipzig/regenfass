# @regenfass/brand

Shared SolidJS UI, theme tokens, and Tailwind preset for Regenfass web apps.

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

See `web/brand-showcase` for a live gallery (brand.regenfass.eu).
