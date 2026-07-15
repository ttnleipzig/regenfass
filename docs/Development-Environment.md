# Development environment

What you need on a machine (or in a Cloud Agent / Dev Container) to work on regenfass.

## Required tools

| Tool                | Used for              | Notes                                                              |
| ------------------- | --------------------- | ------------------------------------------------------------------ |
| **Node.js** 20+     | All `web/*` packages  | CI installer tests use Node 20; Pages deploy uses 24               |
| **pnpm** 10.x       | Workspace installs    | Repo pins `packageManager: pnpm@10.28.0`; prefer `corepack enable` |
| **Git**             | Source control        | Conventional Commits (see [Coding Guidelines](Coding-Guidelines))  |
| **PlatformIO Core** | Firmware build/upload | `pip install platformio` or PlatformIO IDE                         |
| **Python 3**        | PlatformIO            | CI firmware jobs use Python 3.9                                    |

## Optional / situational

| Tool                           | When                                                                        |
| ------------------------------ | --------------------------------------------------------------------------- |
| **Chromium** (Chrome, Edge, …) | Web Serial flashing and full hardware E2E                                   |
| **USB serial access**          | Physical Heltec / ESP32 board                                               |
| **Go** toolchain               | Working in `backend/`                                                       |
| **Docker**                     | Backend `compose.yml` / local API stack                                     |
| **Playwright browsers**        | Installer E2E: `pnpm exec playwright install chromium` from `web/installer` |

## Dev Container

`.devcontainer/devcontainer.json` builds with Node enabled and runs `corepack enable && pnpm install` after create (workspace root). PlatformIO IDE extension is suggested for firmware work.

## Cursor Cloud / agents

Root `AGENTS.md` (including **Cursor Cloud specific instructions**) is the source of truth for agents: install from the **repo root**, use filters or `web/installer` for installer tasks, and remember Web Serial needs Chromium + hardware for full flash flows.

## Secrets

Do not commit `.env` files. Firmware keys in `platformio.ini` `[user_configuration]` are local secrets — treat them carefully and avoid pasting them into public issues or wiki pages.

## Wiki prerequisite

The GitHub Wiki must be **enabled** on the repository for the `wiki-sync` workflow to push. Enable it once under repo **Settings → Features → Wikis** (or create the wiki with an initial page in the UI). See [Deployment](Deployment).
