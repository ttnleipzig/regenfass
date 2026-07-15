# regenfass contributor wiki

Welcome — this is the **technical contributor documentation** for [regenfass](https://github.com/ttnleipzig/regenfass) (“rain barrel”): an IoT water-level sensor that talks to The Things Network (TTN) over LoRaWAN, plus the web tools that flash and configure devices.

End-user product docs live on [docs.regenfass.eu](https://docs.regenfass.eu). Public sites: [regenfass.eu](https://regenfass.eu) (marketing), [install.regenfass.eu](https://install.regenfass.eu) (installer), [brand.regenfass.eu](https://brand.regenfass.eu) (design playground). This wiki is for people who build firmware, web apps, CI, or the backend.

## What lives where

| Area | Path | Role |
|------|------|------|
| Firmware | `src/`, `lib/`, `platformio.ini` | ESP32 / Heltec LoRaWAN sketch (PlatformIO, Arduino, C++17) |
| Web apps | `web/*` | pnpm workspace: installer, brand, marketing, docs site, brand showcase |
| Backend | `backend/` | Go API for devices and sensor data |
| Contributor docs | `docs/` | This wiki source (synced to GitHub Wiki) |

## Web packages (`web/`)

| Package | Path | Production URL |
|---------|------|----------------|
| Marketing | `web/marketing` | [regenfass.eu](https://regenfass.eu) |
| Docs site | `web/docs` | [docs.regenfass.eu](https://docs.regenfass.eu) |
| Installer | `web/installer` | [install.regenfass.eu](https://install.regenfass.eu) |
| Brand showcase | `web/brand-showcase` | [brand.regenfass.eu](https://brand.regenfass.eu) |
| Brand library | `web/brand` | shared `@regenfass/brand` (no public site) |

The installer is a **SolidJS** app (not React). It uses Web Serial and `esptool-js` to flash ESP32 hardware from Chromium-based browsers. Deploy details: [Netlify Deployment](Netlify-Deployment).

## Quick links

- [Project Structure](Project-Structure)
- [Hardware Support](Hardware-Support)
- [Architecture](Architecture)
- [Local Development](Local-Development)
- [Development Environment](Development-Environment)
- [Build Process](Build-Process)
- [Testing](Testing)
- [Coding Guidelines](Coding-Guidelines)
- [Component Structure](Component-Structure)
- [Deployment](Deployment) · [Netlify Deployment](Netlify-Deployment)
- [Release Process](Release-Process) · [GitHub Actions](GitHub-Actions)

## First five minutes

1. Install [Node.js](https://nodejs.org/) (20+; CI uses 20/24) and enable Corepack: `corepack enable`.
2. From the repo root: `pnpm install` (workspace installs all `web/*` packages).
3. Start the installer: `pnpm dev:installer` (or `cd web/installer && pnpm dev`).
4. For firmware: install PlatformIO and run `pio run` from the repo root.

Full Web Serial flash/configure flows need a **Chromium** browser and a physical device; unit and most E2E smoke tests do not.
