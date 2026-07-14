# Deployment

## Overview

| Target | What | How |
|--------|------|-----|
| **Netlify** (preferred for web) | marketing → `regenfass.eu`, docs → `docs.regenfass.eu`, installer → `install.regenfass.eu`, brand → `brand.regenfass.eu` | **Built on GitHub Actions**, deployed with Netlify CLI — [Netlify Deployment](Netlify-Deployment) |
| **GitHub Pages** (fallback) | installer static `dist` | `.github/workflows/installer-deploy.yml` |
| **GitHub Releases** | Firmware `.bin` artifacts | `.github/workflows/sketch-release.yml` + Release Please |
| **GitHub Wiki** | Contributor docs from `/docs` | `.github/workflows/wiki-sync.yml` |
| **Backend** | Go API | Deploy from `backend/` (Docker/host) — project-specific |

## Enable GitHub Wiki (required for wiki sync)

The wiki-sync Action clones `https://github.com/<owner>/<repo>.wiki.git`. That remote exists only after Wikis are enabled:

1. Repository **Settings → General → Features → Wikis**.
2. Optionally create the first wiki page in the GitHub UI so the wiki git repo is initialized.
3. On push to `main` touching `docs/**` (or `workflow_dispatch`), the Action force-syncs `/docs` into the wiki.

If the wiki was never created, the clone step **fails with a clear error** — enable Wikis and re-run.

### Flat docs only

GitHub Wikis do not support nested directories well. Keep all contributor pages as flat files under `/docs` (for example `Architecture.md`, not `docs/arch/overview.md`).

## Firmware releases

Merging conventional commits to `main` opens/updates a Release Please PR. Merging that release PR tags the repo and the sketch-release workflow attaches built firmware binaries. Details: [Release Process](Release-Process).

## Installer on GitHub Pages

Until Netlify hosts the installer in production, `installer-deploy.yml` builds from `web/installer` and deploys Pages from `web/installer/dist` on pushes to `main`, releases, or manual dispatch.
