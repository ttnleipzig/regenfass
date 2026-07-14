# Netlify deployment

Prefer **one Netlify site per web app**. A single root `netlify.toml` for multiple apps is awkward in a monorepo; use the Netlify UI **Base directory** set to the package (for example `web/installer`) plus a local `netlify.toml`.

## Sites

| Site | Package path | Filter / build | Publish dir (from package) |
|------|--------------|----------------|----------------------------|
| Installer | `web/installer` | `pnpm --filter @ttnleipzig/regenfass-installer build` | `dist` |
| Brand showcase | `web/brand-showcase` | `pnpm --filter @ttnleipzig/regenfass-brand-showcase build` | `dist` |
| Marketing | `web/marketing` | `pnpm --filter @ttnleipzig/regenfass-marketing build` | `dist` |
| Docs site | `web/docs` | `pnpm --filter @ttnleipzig/regenfass-docs-site build` | `dist` |

Shared library `@regenfass/brand` is **not** deployed alone; it is bundled into the apps.

## Recommended `netlify.toml` (package as base)

Example used by the installer when Netlify **Base directory** = `web/installer`:

```toml
[build]
  command = "cd ../.. && corepack enable && pnpm install && pnpm --filter @ttnleipzig/regenfass-installer build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The `cd ../..` reaches the monorepo root so the workspace lockfile and `@regenfass/brand` resolve correctly.

Brand-showcase can use the same pattern with its filter name. Marketing and docs sites follow the same template once those packages ship a Vite `build` script.

## Netlify UI checklist

1. Create a new site linked to this GitHub repo.
2. Set **Base directory** to the app folder under `web/`.
3. Confirm build command / publish directory match that package’s `netlify.toml`.
4. Enable SPA redirect (`/*` → `/index.html`) for client-side routers (`@solidjs/router`).
5. Use Node 20+ (Corepack will activate the pinned pnpm version from root `package.json`).

## Relationship to GitHub Pages

`installer-deploy.yml` still publishes the installer to GitHub Pages as a fallback. New production traffic should point at Netlify; leave the Pages workflow until cutover is complete.
