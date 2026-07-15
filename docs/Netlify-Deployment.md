# Netlify deployment (all web apps)

Web apps are **built on GitHub Actions** and **hosted on Netlify**. Netlify’s own builder is intentionally skipped so monorepo/`pnpm` workspace builds stay on CI.

```mermaid
flowchart LR
  push[push to main] --> gha[GitHub Actions build]
  gha --> cli[netlify CLI deploy]
  cli --> m[regenfass.eu]
  cli --> d[docs.regenfass.eu]
  cli --> i[install.regenfass.eu]
  cli --> b[brand.regenfass.eu]
```

## Target sites and subdomains

| Public URL | Netlify site (suggested name) | Publish dir (from repo root) | Site ID secret |
|------------|-------------------------------|------------------------------|----------------|
| <https://regenfass.eu> | `regenfass-marketing` | `web/marketing/dist` | `NETLIFY_SITE_ID_MARKETING` |
| <https://docs.regenfass.eu> | `regenfass-docs` | `web/docs/dist` | `NETLIFY_SITE_ID_DOCS` |
| <https://install.regenfass.eu> | `regenfass-installer` | `web/installer/dist` | `NETLIFY_SITE_ID_INSTALLER` |
| <https://brand.regenfass.eu> | `regenfass-brand` | `web/brand-showcase/dist` | `NETLIFY_SITE_ID_BRAND` |

Auth for all deploys: `NETLIFY_AUTH_TOKEN` (personal access token or Netlify deploy token with site deploy rights).

Workflow: `.github/workflows/web-deploy-netlify.yml`.

## Why not build on Netlify?

A previous Netlify setup used `cd ../..` inside `web/*/netlify.toml`, which assumes a package **Base directory**. With Base directory left empty (repo root = `/opt/build/repo`), that `cd` ends up in `/opt` and fails with `ERR_PNPM_NO_PKG_MANIFEST`.

Building in GitHub Actions keeps one workspace install (`pnpm install` at the monorepo root), shared `@regenfass/brand`, and identical artifacts for all four sites.

## One-time Netlify setup

For each of the four sites:

1. **Add site** in Netlify (empty site or “Import from Git”, then disable auto-build — see below).
2. Attach the custom domain (table above) and wait for DNS + HTTPS.
3. Copy the **Site ID** (Site configuration → Site details → Site ID) into the matching GitHub secret.
4. Create a Netlify **personal access token** (User settings → Applications → Personal access tokens) and store it as GitHub secret `NETLIFY_AUTH_TOKEN`.

### Stop Netlify from building on every git push

Each `web/*/netlify.toml` sets:

```toml
[build]
  ignore = "exit 0"
```

So if the GitHub repo is still linked for continuous deployment, Netlify **skips** its builder. Production updates come only from the Actions workflow (`netlify deploy --prod --dir=…`).

Also set in the Netlify UI (recommended):

- **Base directory:** empty (repository root) — do **not** set `web/docs` etc. if you still keep a linked repo
- Or disconnect “Build settings → Stop builds” / use deploy-only sites created without a Git link (CLI-only)

### SPA redirects

Each app has `public/_redirects` (`/* → /index.html` 200) so client-side routes survive refresh after CLI deploys. The same rule remains in `netlify.toml` for reference.

## GitHub secrets checklist

Add these under **Settings → Environments → `production`** (preferred — the deploy workflow uses that environment) or as repository secrets.

| Secret | Purpose |
|--------|---------|
| `NETLIFY_AUTH_TOKEN` | Authenticate `netlify deploy` |
| `NETLIFY_SITE_ID_MARKETING` | Marketing site ID |
| `NETLIFY_SITE_ID_DOCS` | Docs site ID |
| `NETLIFY_SITE_ID_INSTALLER` | Installer site ID |
| `NETLIFY_SITE_ID_BRAND` | Brand showcase site ID |

### Swetrix analytics (build-time env)

Each site needs its **own** Swetrix project ID at build time (Vite inlines `import.meta.env.VITE_*`). Because production builds run in **GitHub Actions**, set these repository or `production` environment secrets (written into each app’s `.env` as `VITE_SWETRIX_PROJECT_ID` before `pnpm build`):

| Secret | App |
|--------|-----|
| `SWETRIX_PROJECT_ID_MARKETING` | Marketing |
| `SWETRIX_PROJECT_ID_DOCS` | Docs |
| `SWETRIX_PROJECT_ID_INSTALLER` | Installer |
| `SWETRIX_PROJECT_ID_BRAND` | Brand showcase |

Locally, put the same names in the repository root `.env`, then run `node scripts/sync-swetrix-env.mjs`.

A present auth token with a missing Site ID only skips that site (warning in the Actions log). The job can still be green — check the annotations, not just the check mark.

## Manual / local deploy

Build first, then deploy the already-built `dist/` (do not let the CLI rebuild). In this monorepo you **must** pass `--filter` so the CLI does not hang on an interactive project picker:

```bash
corepack enable && pnpm install
pnpm build:docs   # or :marketing / :installer / :brand

export NETLIFY_AUTH_TOKEN=…
export NETLIFY_SITE_ID=…   # that site’s ID
CI=true npx netlify-cli@23 deploy --prod --dir=web/docs/dist \
  --filter @ttnleipzig/regenfass-docs-site
```

| App | `--dir` | `--filter` |
|-----|---------|------------|
| Marketing | `web/marketing/dist` | `@ttnleipzig/regenfass-marketing` |
| Docs | `web/docs/dist` | `@ttnleipzig/regenfass-docs-site` |
| Installer | `web/installer/dist` | `@ttnleipzig/regenfass-installer` |
| Brand | `web/brand-showcase/dist` | `@ttnleipzig/regenfass-brand-showcase` |

Production Netlify hostnames (until custom domains are attached):

- <https://regenfass-marketing.netlify.app>
- <https://regenfass-docs.netlify.app>
- <https://regenfass-installer.netlify.app>
- <https://regenfass-brand.netlify.app>

## Fallback build command (if you must build on Netlify)

Leave **Base directory empty** (repo root) and use a root-relative command — **never** `cd ../..` from root:

```toml
[build]
  command = "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @ttnleipzig/regenfass-docs-site build"
  publish = "web/docs/dist"
```

Remove or comment `ignore = "exit 0"` only if you intentionally switch back to Netlify builds.

## Related

- [Deployment](Deployment) — overview
- [Build Process](Build-Process)
- Workflow: `.github/workflows/web-deploy-netlify.yml`
