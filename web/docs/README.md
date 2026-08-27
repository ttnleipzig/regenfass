# Regenfass Documentation Site

![Regenfass Documentation](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-documentation.svg)

The documentation site publishes setup guides and project information for
Regenfass users. It renders the shared documentation content in a localized
SolidJS application.

## Technology

- SolidJS and TypeScript
- Vite
- Markdown content
- `@regenfass/brand` for the shared shell and visual language

## Development

Install dependencies from the repository root:

```bash
pnpm install
pnpm dev:docs
```

The development server runs on [http://localhost:5176](http://localhost:5176).

## Checks

```bash
pnpm build:docs
```

This runs the TypeScript check and production build.

## Links

- [Live documentation](https://docs.regenfass.eu)
- [Repository documentation](../../docs/Home.md)
