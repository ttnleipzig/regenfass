# GitHub Actions

Workflows live under `.github/workflows/`.

## Web / installer

| Workflow file | Trigger (summary) | Role |
|---------------|-------------------|------|
| `web-ci.yml` | PR / push to `main` | Root `pnpm install`, build web packages, run installer unit tests |
| `installer-test.yml` | PR / push `main` / dispatch | Lint/build path via install+build, Vitest, coverage, Playwright Chromium |
| `installer-pr.yml` | PR on feat/fix/ci/… branches | Playwright report action for PRs |
| `installer-deploy.yml` | Push `main` / release / dispatch | Build `web/installer` → GitHub Pages |

All installer paths use **`web/installer`** and the **root** `pnpm-lock.yaml` (workspace install).

## Firmware

| Workflow file | Role |
|---------------|------|
| `sketch-pr.yml` | Build firmware on PRs |
| `sketch-release.yml` | Build on `main`/tags, Release Please, upload binaries to releases |

## Docs wiki

| Workflow file | Role |
|---------------|------|
| `wiki-sync.yml` | On push to `main` when `docs/**` changes, or `workflow_dispatch`: **force-sync** `/docs` → GitHub Wiki |

Permissions: `contents: write`. Uses `GITHUB_TOKEN` to clone and push `https://github.com/${{ github.repository }}.wiki.git`. Wiki must be enabled (see [Deployment](Deployment)). On first-run clone failure the job exits with a clear message.

Force-sync behavior:

1. Clone wiki (or fail clearly if missing).
2. Delete all tracked wiki files except `.git`.
3. Copy `docs/*` into the wiki working tree.
4. Commit and push (force if needed) so the wiki **exactly** matches `/docs`.

## Other

| Workflow file | Role |
|---------------|------|
| `organize-project.yml` | Auto-add new issues to the org project board |
| `analyze-static-datadog.yml` | Static analysis / Datadog-related checks |

## Tips for contributors

- Node/pnpm setup should cache `pnpm-lock.yaml` at the **repository root**.
- Do not `cd installer` — that path is obsolete; use `web/installer` or `pnpm --filter …`.
- Playwright needs an extra `playwright install` step; Vitest alone does not install browsers.
