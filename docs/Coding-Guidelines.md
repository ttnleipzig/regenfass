# Coding guidelines

## Languages and frameworks

| Area | Rule |
|------|------|
| Installer / brand / web UIs | **SolidJS only** — never React |
| New installer code | TypeScript, strict typing; avoid `any` unless localized |
| Firmware | C++17 Arduino style; feature flags `FEATURE_*`; modular sensors/display/buttons |
| Commits | [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) in **English**, imperative mood |

## pnpm and working directories

- This is a **pnpm workspace** (`pnpm-workspace.yaml` → `web/*`).
- Install from the **repo root**: `pnpm install`.
- Run installer scripts from `web/installer` **or** use root filters / `pnpm --filter @ttnleipzig/regenfass-installer …`.
- Do **not** use npm or yarn for Node work in this repo.

## Commits

Subject form:

```text
<type>(<optional-scope>): <short description>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Installer commits are checked with `@commitlint/config-conventional` (`web/installer/commitlint.config.cjs`) via Husky (`commit-msg` / `pre-commit`). Prefer **squash merges** into `main` so Release Please sees one conventional subject per PR.

Full detail: root `AGENTS.md` → Conventional Commits, and [CONTRIBUTING.md](https://github.com/ttnleipzig/regenfass/blob/main/CONTRIBUTING.md).

## Documentation tone

- **Contributor wiki** (`docs/`): friendly English that stays technical and accurate.
- **Installer UI component docs** under `web/installer/docs`: friendly English; audience is not assumed to be deep experts.
- Prefer **Mermaid** for architecture/flow diagrams.
- Do **not** paste full file trees into Markdown (`.agents/rules/filetree.mdc`).
- Do not hand-edit generated files such as `web/installer/docs/COMPONENTS.md` — run `pnpm docs:components`.

## Icons and components

- Prefer [shadcn-solid](https://shadcn-solid.com/docs/components/) patterns and solid-icons in installer UI.
- Shared look & feel: import from `@regenfass/brand` where appropriate.

## Gender-neutral wording

Prefer gender-neutral language in docs and UI copy where it applies.
