# Testing

## Installer (`web/installer`)

### Unit and component tests (Vitest)

```bash
cd web/installer
pnpm test:run          # CI-style single run
pnpm test              # watch
pnpm test:coverage
pnpm test:ui           # Vitest UI
```

From repo root: `pnpm test` → filter `@ttnleipzig/regenfass-installer` `test:run`.

- Environment: **jsdom** (see `vite.config.ts` `test` block).
- Setup: `tests/setup.ts`.
- Playwright `*.spec.ts` files are **excluded** from Vitest; run them with Playwright.

### Component test layout

Paths under `web/installer/tests/components/` must **mirror** `web/installer/src/components/` (same relative path, `*.test.tsx`). See `.cursor/rules/test-structure.mdc`.

### End-to-end (Playwright)

```bash
cd web/installer
pnpm exec playwright install --with-deps chromium
pnpm exec playwright test
```

Smoke specs live under `web/installer/tests/` (for example `home.smoke.spec.ts`). Full flash/configure E2E against real hardware needs **Chromium + USB device**; CI installs Chromium but does not attach physical boards.

### Lint / typecheck

```bash
cd web/installer
pnpm lint        # tsc --noEmit + markdownlint-cli2
pnpm lint:ts
pnpm lint:md
```

Root: `pnpm lint`.

## Firmware

PlatformIO native / embedded tests live under `test/` as configured by the project. Prefer `pio test` when environments define them. PR firmware builds are covered by `sketch-pr.yml`.

## Backend

Go tests: run `go test ./…` from `backend/` (or targeted packages under `internal/`).

## Coverage

Installer coverage can be uploaded to Codecov from `installer-test.yml` (`web/installer/coverage/lcov.info`, flag `installer`).
