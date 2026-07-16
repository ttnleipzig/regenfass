# Project structure

High-level layout of the monorepo. Prefer describing areas by name rather than dumping full directory trees in docs.

## Top level

| Path                 | Purpose                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `firmware/`          | PlatformIO project: `src/`, `lib/` (SCP), `include/`, `board_partitions/`, `test/`, `platformio.ini`   |
| `web/`               | pnpm workspace of SolidJS / Vite apps, shared brand, and dashboard API                                  |
| `docs/`              | Contributor technical docs (this wiki source — **flat files only**)                                     |
| `.github/workflows/` | CI: firmware, installer, web build checks, wiki sync, releases                                          |
| `AGENTS.md`          | Guidance for coding agents and humans on stack and conventions                                          |

## Web workspace

Root `pnpm-workspace.yaml` includes `web/*`. Root `package.json` defines convenience scripts such as `dev:installer`, `build:installer`, and `pnpm -r --filter "./web/**" run build`.

| Package directory    | npm name                               | Notes                                                                        |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `web/brand`          | `@regenfass/brand`                     | Shared components, `styles.css`, Tailwind preset; consumed via `workspace:*` |
| `web/brand-showcase` | `@ttnleipzig/regenfass-brand-showcase` | Vite app on port **5174**                                                    |
| `web/installer`      | `@ttnleipzig/regenfass-installer`      | Main flash/config UI; Vitest + Playwright                                    |
| `web/marketing`      | `@ttnleipzig/regenfass-marketing`      | Marketing site (`pnpm dev:marketing` / `build:marketing`)                    |
| `web/docs`           | `@ttnleipzig/regenfass-docs-site`      | User-facing docs site (`pnpm dev:docs` / `build:docs`)                       |
| `web/dashboard`      | _(Go module, not npm)_                 | Go HTTP API + Grafana/Docker; not part of the pnpm package graph             |

Run package scripts either from the package directory (`cd web/installer && pnpm …`) or from the root with filters (`pnpm --filter @ttnleipzig/regenfass-installer …`).

## Firmware concerns

Firmware is organized by feature (sensors, displays, LoRaWAN, buttons, configuration). Optional pieces are gated with `FEATURE_*` flags in `firmware/platformio.ini`. Default env is typically `heltec_wifi_lora_32_V3_HCSR04` (see `firmware/platformio.ini`).

## Dashboard

The Go service under `web/dashboard/` exposes an API for LoRaWAN rain-barrel devices and sensor data (see `web/dashboard/main.go` swagger header). It has its own Docker/`compose` setup and is **not** a pnpm package (no `package.json`).

## GitHub Wiki note

GitHub Wikis do **not** handle nested directories well. Keep everything under `/docs` as **flat** top-level Markdown files (e.g. `Home.md`, `Architecture.md`). Nested folders under `docs/` should not be added.
