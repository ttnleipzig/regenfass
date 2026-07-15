# Agent instructions

This file orients coding agents and automation working on **regenfass**: firmware (Arduino / PlatformIO, C++) plus **web apps** under `web/` (installer, brand, marketing, docs site, brand showcase) and an optional Go **backend**. **regenfass** (“rain barrel”) is an IoT project: water-level sensing and LoRaWAN data via The Things Network (TTN). Always-on, path-specific rules also live in `.agents/rules/` (see the `*.mdc` files and, for installer-focused defaults, `.agents/rules/AGENT.md`).

## Scope of the repository

- **Firmware**: LoRaWAN / TTN-related embedded code; builds via PlatformIO (`platformio.ini`).
- **Web**: pnpm workspace (`pnpm-workspace.yaml` → `web/*`). Primary apps:
  - `web/installer` — `@ttnleipzig/regenfass-installer` (flash & configure)
  - `web/brand` — `@regenfass/brand` (shared UI / Tailwind preset)
  - `web/brand-showcase` — design playground (port **5174**)
  - `web/marketing` — `@ttnleipzig/regenfass-marketing`
  - `web/docs` — `@ttnleipzig/regenfass-docs-site` (user-facing docs site)
- **Backend**: Go API under `backend/`.
- **Contributor docs**: flat Markdown under `docs/` (synced to GitHub Wiki).

When in doubt, limit changes to the area the task actually touches (firmware vs web vs backend).

## Architecture (overview)

**Firmware** is organized by concern: sensors (e.g. water level), displays, LoRaWAN, buttons, and configuration under `src/`, with shared SCP (Serial Configuration Protocol) code under `lib/scp/` for device configuration. **Hardware** partition tables live under `board_partitions/`. Do not paste full directory trees into docs (see `.agents/rules/filetree.mdc`).

**Installer** is a SolidJS app for device settings, flashing ESP32 hardware, and Web Serial. Shared UI comes from `@regenfass/brand` (`web/brand`). Installer-specific UI lives under `web/installer/src/components/` (for example flash steps); installer logic and state under `web/installer/src/installer/`; shared utilities and SCP under `web/installer/src/libs/`. The component gallery is the brand showcase (`web/brand-showcase`), not an installer playground.

## Technology stack

**Firmware**: PlatformIO, Arduino framework, C++17, ESP32, LoRaWAN 1.0.2 (OTAA).

**Installer / web UIs**: SolidJS (not React), shadcn-solid, solid-icons, Tailwind CSS, XState, Vite, pnpm workspace.

## Package manager and commands

- Use **pnpm** for Node work. Root pins `packageManager: pnpm@10.28.0`.
- **Install from the repository root**: `pnpm install` (workspace covers `web/*`).
- Run scripts via root helpers (`pnpm dev:installer`, `pnpm build`, `pnpm test`, `pnpm lint`) or filters (`pnpm --filter @ttnleipzig/regenfass-installer …`), or `cd web/installer && pnpm …`.
- Typical installer workflows: `pnpm dev` / `build` / `test:run` / `lint` from `web/installer`.
- Firmware: `pio run` (from repo root, PlatformIO).
- Component docs generation (installer): `pnpm docs:components` (and playground registry: `pnpm playground:registry` when adding components).

## Installer UI stack (mandatory choices)

- **Framework**: **SolidJS only** — do not introduce React.
- **Atomic Design**: Follow `.agents/rules/atomic-design-installer.mdc` (Brad Frost methodology mapped to `atoms/`, `molecules/`, `organisms/`, `forms/`, `ui/`, plus templates and pages via layouts and routes).
- **Components**: Prefer [shadcn-solid](https://shadcn-solid.com/docs/components/) patterns; follow their setup and keep theming consistent.
- **Icons**: Use **solid-icons** in the installer UI.
- **State / routing**: Respect existing patterns (e.g. XState, `@solidjs/router`) already used in the codebase.

## Cursor / project rules (quick map)

Important rule files under `.agents/rules/` include: `framework.mdc` (SolidJS), `atomic-design-installer.mdc` (installer UI hierarchy), `pnpm-installer.mdc` (pnpm from workspace / `web/installer`), `documentation.mdc`, `markdown-tables.mdc` (aligned Markdown tables), `solid-shadcn-components.mdc`, `icons.mdc`, `architekturdiagramme.mdc` (Mermaid), `test-structure.mdc`, `conventional-commits.mdc`, and `filetree.mdc`.

## Coding conventions

- **Documentation**: Friendly English for end-user and contributor-facing text; contributor wiki under `docs/` may be more technical. Prettify Markdown tables (aligned columns) per `.agents/rules/markdown-tables.mdc`.
- **Code and collaboration**: Gender-neutral wording where it applies; **Conventional Commits** in English for commit subjects (full detail below).
- **Firmware**: Use feature flags (`FEATURE_*`) for optional parts; keep sensor, display, and button code modular; follow usual Arduino naming habits.
- **Installer**: TypeScript for new code; shadcn-solid and solid-icons as above; hand-written component docs under `web/installer/docs` following existing layout.

## Common tasks

### New sensor (firmware)

1. Add sensor code under `src/sensors/`.
2. Wire feature flags in `platformio.ini` if needed.
3. Integrate in `src/main.cpp` with conditional compilation.
4. Update the root `README.md` hardware section if relevant.

### New installer UI component

1. Place it under the right layer: `atoms/`, `molecules/`, or `organisms/`.
2. Prefer shadcn-solid primitives; add proper TypeScript types.
3. Run `pnpm docs:components` and update hand-written docs under `web/installer/docs` as needed.
4. If the component is shared, expose it from `@regenfass/brand` and verify it in the brand showcase (`pnpm dev:brand`).

### Configuration

- Firmware: `src/config/` (e.g. `config.h` / `config.cpp`).
- Installer forms and flow: `web/installer/src/installer/forms/`, state in `web/installer/src/installer/state.ts`.

## Guardrails

- **SolidJS, not React** in installer / brand UIs.
- **pnpm**, not npm/yarn, for Node in this repo.
- **Secrets**: `.env` (not committed) per project convention.
- **New component props**: Update types, related docs, generated/living docs, and playground props when applicable.
- **Tests**: Component tests under `web/installer/tests/components/` must mirror `web/installer/src/components/` (see `test-structure.mdc`). Additional tests may exist under `web/installer/src/test/`; keep them consistent when you change behavior.
- **Linting**: Respect markdownlint, ESLint/Prettier, and commitlint (installer) as configured.

## Tests

- Component tests live under `web/installer/tests/components/` and **must mirror** the folder layout of `web/installer/src/components/` (same relative path, `*.test.tsx` naming). See `.agents/rules/test-structure.mdc`.

## Documentation

- Write **end-user and contributor-facing docs in friendly English**; audience is not assumed to be deeply technical (contributor `docs/` wiki can stay technical).
- **Do not paste full directory trees** into Markdown docs (`.agents/rules/filetree.mdc`).
- For **architecture and flow diagrams** in documentation, prefer **Mermaid** (`.agents/rules/architekturdiagramme.mdc`).
- **Installer UI components**: place hand-written docs under `web/installer/docs`, matching the existing layout. Do not manually edit auto-generated files such as `web/installer/docs/COMPONENTS.md` (generated by `web/installer/scripts/generate-components-doc.ts`; runs on prebuild / hooks).
- **Contributor wiki source**: flat files in `/docs` (no nested folders — GitHub Wiki limitation). Synced by `.github/workflows/wiki-sync.yml`.
- When you add or change **component props**, update types, any related docs, and generated/living docs as required by the project pipeline.

## Code quality and Git

- Prefer **TypeScript**, strict typing; avoid `any` unless unavoidable and localized.
- Use the proper ellipsis character **…** where an ellipsis is intended (see **Typography** in `.agents/rules/AGENT.md`).

## Conventional Commits

Commit **subjects** follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and are written in **English**. Cursor always applies `.agents/rules/conventional-commits.mdc`, which defers to this section. When committing from the installer package, messages are checked against `@commitlint/config-conventional` (`web/installer/commitlint.config.cjs`).

### Subject line

```plaintext
<type>(<optional-scope>): <short description>
```

- Use **imperative mood** (`add`, `fix`, `update`), not past tense.
- Keep the description **short** (about 50 characters is a good target; stay under ~72 on the subject line).
- **No trailing period** on the subject.
- `scope` is optional; use a short area when it helps (e.g. `installer`, `firmware`, `ci`).

### Common types

| Type       | When to use                               |
| ---------- | ----------------------------------------- |
| `feat`     | New user-facing behavior or capability    |
| `fix`      | Bug fix                                   |
| `docs`     | Documentation only                        |
| `style`    | Formatting or whitespace; no logic change |
| `refactor` | Code change that is neither feat nor fix  |
| `perf`     | Performance improvement                   |
| `test`     | Adding or changing tests                  |
| `build`    | Build system, dependencies, tooling       |
| `ci`       | CI configuration or scripts               |
| `chore`    | Maintenance that does not fit elsewhere   |
| `revert`   | Reverts a previous commit                 |

### Breaking changes

- Footer: `BREAKING CHANGE: <explanation>`, or a `!` after type/scope, e.g. `feat(api)!: remove legacy endpoint`.

### Examples

```plaintext
feat(installer): add serial reconnect banner
fix(firmware): correct water level overflow on cold boot
docs: explain flash steps for first-time users
chore(deps): bump vite in installer
```

### Anti-patterns

- Vague subjects like `Fixed stuff`, `WIP`, or `updates` — use a real `type` and a specific description.
- Mixing languages in the subject — keep the subject in English.

## Configuration and secrets

- Prefer **environment variables** and a **`.env`** file (not committed) for local credentials and secrets, per project convention.

## Where to look first

- Installer app entry and tooling: `web/installer/README.md`, `web/installer/package.json`.
- Firmware build: `platformio.ini`, `src/main.cpp`.
- Installer app entry: `web/installer/src/App.tsx`, `web/installer/components.json` (shadcn-solid).
- Shared brand: `web/brand`.
- Contributor wiki source: `docs/`.
- Cursor/agent rules: `.agents/rules/`.
- High-level product overview: root `README.md`.

## Additional resources

- Project site: <https://regenfass.ttn-leipzig.de>
- shadcn-solid: <https://shadcn-solid.com/docs/components/>
- SolidJS: <https://www.solidjs.com/>
- PlatformIO: <https://platformio.org/>

## Cursor Cloud specific instructions

- **Node / pnpm:** Node 22+ works; pnpm is pinned via root `packageManager` (`pnpm@10.28.0`). Prefer Corepack (`corepack enable`) so installs match the lockfile.
- **Dependency refresh:** run `pnpm install` from the **repository root** (pnpm workspace). There is **no** top-level `installer/` package — the app lives under `web/installer`.
- **What must run for installer web work:** only the installer Vite app (`pnpm dev:installer` → **5173**). `@regenfass/brand` is a workspace library (no separate server). Backend/Postgres, PlatformIO firmware, marketing/docs/brand-showcase are optional for installer UI work.
- **Other web apps (optional):** `pnpm dev:brand` → 5174, `pnpm dev:marketing` → 5175, `pnpm dev:docs` → 5176.
- **Lint / test / build:** from root — `pnpm lint`, `pnpm test`, `pnpm build:installer` (or `pnpm build` for all web packages). Details also in `docs/Local-Development.md` and `web/installer/README.md`.
- **Web Serial:** full flash/configure E2E needs **Chromium** and **physical USB hardware**. Unit tests run without a board; do not block setup on hardware.
- **Firmware:** PlatformIO from repo root (`pio run`); unrelated to the pnpm workspace. Not required for installer web setup.
- **Netlify:** GitHub Actions builds + `netlify deploy` (see `docs/Netlify-Deployment.md`). Cursor secrets ≠ GitHub Actions secrets — GHA reads **Environments → production**. CLI deploys in this monorepo need `CI=true` and `--filter <package>` or the CLI hangs on a project picker.

---

Keep this file accurate when workflows or stack constraints change.
