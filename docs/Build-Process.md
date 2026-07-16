# Build process

## Web (pnpm workspace)

Install once at the repo root:

```bash
pnpm install
```

Build helpers from root `package.json`:

| Script                 | What it does                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `pnpm build`           | `pnpm -r --filter "./web/**" run build` — all workspace packages that define `build` |
| `pnpm build:installer` | `@ttnleipzig/regenfass-installer` production build                                   |
| `pnpm build:brand`     | brand-showcase production build                                                      |
| `pnpm build:marketing` | marketing package (when present)                                                     |
| `pnpm build:docs`      | docs-site package (when present)                                                     |

Installer build pipeline (`web/installer`):

1. **`prebuild`** → `pnpm docs:components` (generates living component docs).
2. **`build`** → `tsc -b && vite build` → output in `web/installer/dist`.

Brand package `@regenfass/brand` is a library (exports TypeScript/CSS/preset); it does not ship a Vite `dist` of its own. Consumers bundle it through Vite.

Netlify sites should install from the **monorepo root** and filter-build the target package — see [Netlify Deployment](Netlify-Deployment).

## Firmware (PlatformIO)

```bash
cd firmware
pio run
# or
pio run -e <environment>
```

CI (`sketch-pr.yml` / `sketch-release.yml`) builds environments such as `heltec_wifi_lora_32_V3_HCSR04` and uploads `.bin` artifacts. Release tagging is driven by Release Please (see [Release Process](Release-Process)).

## Dashboard

Build with the Go toolchain from `web/dashboard/` (for example `go build`). Container builds use the Docker files under `web/dashboard/`.

## GitHub Pages (legacy / fallback)

`installer-deploy.yml` still builds the installer and publishes `web/installer/dist` to GitHub Pages. Prefer Netlify for multi-site web hosting; keep Pages as a temporary fallback until sites are cut over.
