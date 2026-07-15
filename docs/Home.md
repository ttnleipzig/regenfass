# regenfass contributor wiki

Welcome — this is the **technical contributor documentation** for [regenfass](https://github.com/ttnleipzig/regenfass) (“rain barrel”): an IoT water-level sensor that talks to The Things Network (TTN) over LoRaWAN, plus the web tools that flash and configure devices.

End-user product docs live on the public site ([regenfass.ttn-leipzig.de](https://regenfass.ttn-leipzig.de)). This wiki is for people who build firmware, web apps, CI, or the backend.

## What lives where

| Area             | Path                             | Role                                                                   |
| ---------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Firmware         | `src/`, `lib/`, `platformio.ini` | ESP32 / Heltec LoRaWAN sketch (PlatformIO, Arduino, C++17)             |
| Web apps         | `web/*`                          | pnpm workspace: installer, brand, marketing, docs site, brand showcase |
| Backend          | `backend/`                       | Go API for devices and sensor data                                     |
| Contributor docs | `docs/`                          | This wiki source (synced to GitHub Wiki)                               |

## Web packages (`web/`)

```text
web/
├── brand              # @regenfass/brand — shared SolidJS UI / Tailwind preset
├── brand-showcase     # @ttnleipzig/regenfass-brand-showcase — design playground
├── marketing          # @ttnleipzig/regenfass-marketing — marketing site
├── docs               # @ttnleipzig/regenfass-docs-site — user-facing docs site
└── installer          # @ttnleipzig/regenfass-installer — flash & configure devices
```

The installer is a **SolidJS** app (not React). It uses Web Serial and `esptool-js` to flash ESP32 hardware from Chromium-based browsers.

## Quick links

- [Project Structure](Project-Structure)
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
