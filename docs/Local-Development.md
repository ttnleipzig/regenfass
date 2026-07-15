# Local development

## Clone and install (web)

```bash
git clone https://github.com/ttnleipzig/regenfass.git
cd regenfass
corepack enable
pnpm install
```

This installs the pnpm workspace for all packages under `web/*` using the **root** `pnpm-lock.yaml`.

## Run web apps

From the **repository root**:

| Script | Package | Typical URL |
|--------|---------|-------------|
| `pnpm dev:installer` | `@ttnleipzig/regenfass-installer` | <http://localhost:5173> (Vite default) |
| `pnpm dev:brand` | `@ttnleipzig/regenfass-brand-showcase` | <http://localhost:5174> |
| `pnpm dev:marketing` | `@ttnleipzig/regenfass-marketing` | <http://localhost:5175> |
| `pnpm dev:docs` | `@ttnleipzig/regenfass-docs-site` | <http://localhost:5176> |

Equivalent filter form:

```bash
pnpm --filter @ttnleipzig/regenfass-installer dev
```

Or change into the package:

```bash
cd web/installer && pnpm dev
```

### Installer-only commands (from `web/installer`)

| Command | Purpose |
|---------|---------|
| `pnpm lint` | Typecheck + markdownlint |
| `pnpm test` / `pnpm test:run` | Vitest unit/component tests |
| `pnpm test:coverage` | Coverage report |
| `pnpm build` | `tsc -b` + Vite production build (runs `docs:components` via `prebuild`) |
| `pnpm docs:components` | Regenerate component markdown |
| `pnpm playground:registry` | Refresh playground registry |

Root shortcuts: `pnpm lint`, `pnpm test`, `pnpm build:installer` delegate to the installer filter.

## Firmware

```bash
# from repo root
pio project config          # inspect merged config
pio run                     # build default env
pio run -e heltec_wifi_lora_32_V3_HCSR04
pio run -t upload -e heltec_wifi_lora_32_V3_HCSR04
```

See also [CONTRIBUTING.md](https://github.com/ttnleipzig/regenfass/blob/main/CONTRIBUTING.md) for PlatformIO tips.

## Backend

Work inside `backend/` with the Go module (`go.mod`). Optional Docker Compose lives next to the Dockerfile there. API swagger host metadata defaults to `localhost:64000`.

## Web Serial caveat

Flashing and live device configuration require:

1. A **Chromium-based** browser with Web Serial support.
2. A connected **USB device** (and OS permissions for the serial port).

Unit tests and most Playwright smoke tests run without hardware. Full “hello world” flash flows are hardware-bound.

## Analytics (Swetrix)

Each Vite app under `web/` uses its own Swetrix project. Copy `web/<app>/.env.example` to `web/<app>/.env` and set `VITE_SWETRIX_PROJECT_ID`. If the variable is empty or missing, tracking stays disabled (safe for local work).

Shared helpers live in `@regenfass/brand` (`initAnalytics`, `trackEvent`). Theme toggles emit `theme_toggled`; the installer emits `installer_state_<StateName>` on XState transitions; marketing CTAs emit `navigate_to_docs` / `navigate_to_installer`.

To create projects and funnels with a personal Admin API key (same endpoints as the Swetrix MCP):

```bash
# set SWETRIX_API_KEY in the environment or root .env
node scripts/provision-swetrix.mjs
```

## SolidJS reminder

Installer and brand UIs use **SolidJS only** — do not introduce React.
