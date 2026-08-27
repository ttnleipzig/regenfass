# Regenfass Homepage

![Regenfass Homepage](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-web-app.svg)

The Regenfass homepage is the public SolidJS site for the open rainwater
monitoring project. It contains the localized landing page, changelog,
beta-tester signup, legal pages, and shared navigation.

## Technology

- SolidJS and TypeScript
- Vite
- `@regenfass/brand` for shared UI and styles
- Netlify Functions for newsletter and beta-tester signups

## Development

Install dependencies from the repository root:

```bash
pnpm install
pnpm dev:homepage
```

The development server runs on [http://localhost:5175](http://localhost:5175).

## Checks

```bash
pnpm build:homepage
```

This runs the TypeScript check and production build.

## Links

- [Live homepage](https://regenfass.eu)
- [Documentation](https://docs.regenfass.eu)
- [Repository development guide](../../docs/Local-Development.md)
