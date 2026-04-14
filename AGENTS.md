# Agent instructions

This file orients coding agents and automation working on **regenfass**: firmware (Arduino / PlatformIO, C++) plus the **web installer** under `installer/`. **regenfass** (“rain barrel”) is an IoT project: water-level sensing and LoRaWAN data via The Things Network (TTN). Always-on, path-specific rules also live in `.cursor/rules/` (see the `*.mdc` files and, for installer-focused defaults, `.cursor/rules/AGENT.md`).

## Scope of the repository

- **Firmware**: LoRaWAN / TTN-related embedded code; builds via PlatformIO (`platformio.ini`).
- **Installer**: SolidJS + Vite + TypeScript + Tailwind app used to flash and configure devices. Primary package root: `installer/`.

When in doubt, limit changes to the area the task actually touches (firmware vs installer).

## Architecture (overview)

**Firmware** is organized by concern: sensors (e.g. water level), displays, LoRaWAN, buttons, and configuration under `src/`, with shared SCP (Serial Configuration Protocol) code under `lib/scp/` for device configuration. **Hardware** partition tables live under `board_partitions/`. Do not paste full directory trees into docs (see `.cursor/rules/filetree.mdc`).

**Installer** is a SolidJS app (atomic design: atoms, molecules, organisms) for device settings, flashing ESP32 hardware, and Web Serial. Main areas include `installer/src/components/`, installer logic and state under `installer/src/installer/`, shared utilities and SCP under `installer/src/libs/`, and `installer/src/playground/` for UI development.

## Technology stack

**Firmware**: PlatformIO, Arduino framework, C++17, ESP32, LoRaWAN 1.0.2 (OTAA).

**Installer**: SolidJS (not React), shadcn-solid, solid-icons, Tailwind CSS, XState, Vite, pnpm.

## Package manager and commands

- Use **pnpm** for Node work (see `installer/packageManager` in `installer/package.json`).
- Typical installer workflows (from `installer/`): `pnpm dev`, `pnpm build`, `pnpm test:run`, `pnpm lint`.
- Firmware: `pio run` (from repo root, PlatformIO).
- Component docs generation (installer): `pnpm docs:components` (and playground registry: `pnpm playground:registry` when adding components).

## Installer UI stack (mandatory choices)

- **Framework**: **SolidJS only** — do not introduce React.
- **Components**: Prefer [shadcn-solid](https://shadcn-solid.com/docs/components/) patterns; follow their setup and keep theming consistent.
- **Icons**: Use **solid-icons** in the installer UI.
- **State / routing**: Respect existing patterns (e.g. XState, `@solidjs/router`) already used in the codebase.

## Cursor / project rules (quick map)

Important rule files under `.cursor/rules/` include: `framework.mdc` (SolidJS), `documentation.mdc`, `solid-shadcn-components.mdc`, `icons.mdc`, `architekturdiagramme.mdc` (Mermaid), `test-structure.mdc`, `conventional-commits.mdc`, and `filetree.mdc`.

## Coding conventions

- **Documentation**: Friendly English for end-user and contributor-facing text; audience is not assumed to be deeply technical.
- **Code and collaboration**: Gender-neutral wording where it applies; **Conventional Commits** in English for commit subjects (full detail below).
- **Firmware**: Use feature flags (`FEATURE_*`) for optional parts; keep sensor, display, and button code modular; follow usual Arduino naming habits.
- **Installer**: TypeScript for new code; shadcn-solid and solid-icons as above; hand-written component docs under `installer/docs` following existing layout.

## Common tasks

### New sensor (firmware)

1. Add sensor code under `src/sensors/`.
2. Wire feature flags in `platformio.ini` if needed.
3. Integrate in `src/main.cpp` with conditional compilation.
4. Update the root `README.md` hardware section if relevant.

### New installer UI component

1. Place it under the right layer: `atoms/`, `molecules/`, or `organisms/`.
2. Prefer shadcn-solid primitives; add proper TypeScript types.
3. Run `pnpm docs:components` and update hand-written docs under `installer/docs` as needed.
4. Register in the playground when the project uses that workflow (`pnpm playground:registry`).

### Configuration

- Firmware: `src/config/` (e.g. `config.h` / `config.cpp`).
- Installer forms and flow: `installer/src/installer/forms/`, state in `installer/src/installer/state.ts`.

## Guardrails

- **SolidJS, not React** in the installer.
- **pnpm**, not npm/yarn, for Node in this repo.
- **Secrets**: `.env` (not committed) per project convention.
- **New component props**: Update types, related docs, generated/living docs, and playground props when applicable.
- **Tests**: Component tests under `installer/tests/components/` must mirror `installer/src/components/` (see `test-structure.mdc`). Additional tests may exist under `installer/src/test/`; keep them consistent when you change behavior.
- **Linting**: Respect markdownlint, ESLint/Prettier, and commitlint (installer) as configured.

## Tests

- Component tests live under `installer/tests/components/` and **must mirror** the folder layout of `installer/src/components/` (same relative path, `*.test.tsx` naming). See `.cursor/rules/test-structure.mdc`.

## Documentation

- Write **end-user and contributor-facing docs in friendly English**; audience is not assumed to be deeply technical.
- **Do not paste full directory trees** into Markdown docs (`.cursor/rules/filetree.mdc`).
- For **architecture and flow diagrams** in documentation, prefer **Mermaid** (`.cursor/rules/architekturdiagramme.mdc`).
- **Installer UI components**: place hand-written docs under `installer/docs`, matching the existing layout. Do not manually edit auto-generated files such as `installer/docs/COMPONENTS.md` (generated by `installer/scripts/generate-components-doc.ts`; runs on prebuild / hooks).
- When you add or change **component props**, update types, any related docs, and generated/living docs as required by the project pipeline.

## Code quality and Git

- Prefer **TypeScript**, strict typing; avoid `any` unless unavoidable and localized.
- Use the proper ellipsis character **…** where an ellipsis is intended (see **Typography** in `.cursor/rules/AGENT.md`).

## Conventional Commits

Commit **subjects** follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and are written in **English**. Cursor always applies `.cursor/rules/conventional-commits.mdc`, which defers to this section. When committing from the installer package, messages are checked against `@commitlint/config-conventional` (`installer/commitlint.config.cjs`).

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
|------------|-------------------------------------------|
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

- Installer app entry and tooling: `installer/README.md`, `installer/package.json`.
- Firmware build: `platformio.ini`, `src/main.cpp`.
- Installer app entry: `installer/src/App.tsx`, `installer/components.json` (shadcn-solid).
- Cursor/agent rules: `.cursor/rules/`.
- High-level product overview: root `README.md`.

## Additional resources

- Project site: <https://regenfass.ttn-leipzig.de>
- shadcn-solid: <https://shadcn-solid.com/docs/components/>
- SolidJS: <https://www.solidjs.com/>
- PlatformIO: <https://platformio.org/>

---

Keep this file accurate when workflows or stack constraints change.
