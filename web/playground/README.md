# Regenfass Component Playground

![Regenfass Component Playground](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-web-app.svg)

The component playground is the interactive gallery for `@regenfass/brand`.
It makes shared components easy to inspect, search, and test before they are
used by the other Regenfass web applications.

## Technology

- SolidJS and TypeScript
- Vite
- Playwright for browser tests
- `@regenfass/brand` for the component implementations

## Development

Install dependencies from the repository root:

```bash
pnpm install
pnpm dev:playground
```

The development server runs on [http://localhost:5177](http://localhost:5177).

## Checks

```bash
pnpm build:playground
pnpm test:playground
pnpm --filter @ttnleipzig/regenfass-playground test:e2e
```

The coverage check verifies that registered shared components remain reachable
from the playground. The end-to-end suite covers navigation, component search,
and generated JSX output.

## Related projects

- [`@regenfass/brand`](../brand/README.md)
- [Installer](../installer/README.md)
