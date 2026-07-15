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

Each Vite app under `web/` uses its own Swetrix project. Put the IDs in the **repository root** `.env` (no `VITE_` prefix):

```env
SWETRIX_PROJECT_ID_INSTALLER=…
SWETRIX_PROJECT_ID_MARKETING=…
SWETRIX_PROJECT_ID_DOCS=…
SWETRIX_PROJECT_ID_BRAND=…
```

Then sync them into each app as `VITE_SWETRIX_PROJECT_ID` (Vite only exposes `VITE_*` to the browser):

```bash
node scripts/sync-swetrix-env.mjs
```

If `VITE_SWETRIX_PROJECT_ID` is empty or missing in an app, tracking for that app stays disabled.

Shared helpers live in `@regenfass/brand` (`initAnalytics`, `trackEvent`). Theme toggles emit `theme_toggled`; the installer emits `installer_state_<StateName>` on XState transitions; marketing CTAs emit `navigate_to_docs` / `navigate_to_installer`.

### Funnels (create in the Swetrix dashboard)

**Installer** project — funnel name `Flash and configure` (event steps, in order):

1. `installer_state_Start_WaitingForUser`
2. `installer_state_Connect_Connecting`
3. `installer_state_Connect_ReadingVersion`
4. `installer_state_Install_WaitingForInstallationMethodChoice`
5. `installer_state_Install_Installing`
6. `installer_state_Install_MigratingConfiguration`
7. `installer_state_Config_Editing`
8. `installer_state_Config_WritingConfiguration`
9. `installer_state_Finish_ShowingNextSteps`

**Marketing** project:

- `Path to documentation`: page `/` → event `navigate_to_docs`
- `Path to installer`: page `/` → event `navigate_to_installer`

With a valid Admin API key (`SWETRIX_API_KEY`), you can also run:

```bash
node scripts/provision-swetrix.mjs
```

## SolidJS reminder

Installer and brand UIs use **SolidJS only** — do not introduce React.
