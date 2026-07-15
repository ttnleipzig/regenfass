# Project structure

High-level layout of the monorepo. Prefer describing areas by name rather than dumping full directory trees in docs.

## Top level

| Path                            | Purpose                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| `src/`                          | Firmware application code (sensors, display, LoRaWAN, buttons, config)    |
| `lib/`                          | Shared firmware libraries (including SCP — Serial Configuration Protocol) |
| `include/`, `board_partitions/` | Headers and flash partition tables                                        |
| `test/`                         | Firmware / PlatformIO-related tests                                       |
| `platformio.ini`                | PlatformIO environments and feature flags                                 |
| `web/`                          | pnpm workspace of SolidJS / Vite apps and shared brand package            |
| `backend/`                      | Go HTTP API (`go.mod`, `internal/`, SQL via sqlc)                         |
| `docs/`                         | Contributor technical docs (this wiki source — **flat files only**)       |
| `.github/workflows/`            | CI: firmware, installer, web build checks, wiki sync, releases            |
| `AGENTS.md`                     | Guidance for coding agents and humans on stack and conventions            |

## Web workspace

Root `pnpm-workspace.yaml` includes `web/*`. Root `package.json` defines convenience scripts such as `dev:installer`, `build:installer`, and `pnpm -r --filter "./web/**" run build`.

| Package directory    | npm name                               | Notes                                                                        |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `web/brand`          | `@regenfass/brand`                     | Shared components, `styles.css`, Tailwind preset; consumed via `workspace:*` |
| `web/brand-showcase` | `@ttnleipzig/regenfass-brand-showcase` | Vite app on port **5174**                                                    |
| `web/installer`      | `@ttnleipzig/regenfass-installer`      | Main flash/config UI; Vitest + Playwright                                    |
| `web/marketing`      | `@ttnleipzig/regenfass-marketing`      | Marketing site (`pnpm dev:marketing` / `build:marketing`)                    |
| `web/docs`           | `@ttnleipzig/regenfass-docs-site`      | User-facing docs site (`pnpm dev:docs` / `build:docs`)                       |

Run package scripts either from the package directory (`cd web/installer && pnpm …`) or from the root with filters (`pnpm --filter @ttnleipzig/regenfass-installer …`).

## Firmware concerns

Firmware is organized by feature (sensors, displays, LoRaWAN, buttons, configuration). Optional pieces are gated with `FEATURE_*` flags in `platformio.ini`. Default env is typically `heltec_wifi_lora_32_V3_HCSR04` (see `platformio.ini`).

## Backend

The Go service under `backend/` exposes an API for LoRaWAN rain-barrel devices and sensor data (see `backend/main.go` swagger header). It has its own Docker/`compose` setup separate from the web pnpm workspace.

## GitHub Wiki note

GitHub Wikis do **not** handle nested directories well. Keep everything under `/docs` as **flat** top-level Markdown files (e.g. `Home.md`, `Architecture.md`). Nested folders under `docs/` should not be added.
