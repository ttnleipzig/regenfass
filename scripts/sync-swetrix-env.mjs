#!/usr/bin/env node
/**
 * Sync root `.env` Swetrix project IDs into each Vite app's `.env`
 * as `VITE_SWETRIX_PROJECT_ID` (required for client-side Vite exposure).
 *
 * Expected root vars (no VITE_ prefix):
 *   SWETRIX_PROJECT_ID_INSTALLER
 *   SWETRIX_PROJECT_ID_MARKETING
 *   SWETRIX_PROJECT_ID_DOCS
 *   SWETRIX_PROJECT_ID_BRAND
 *
 * Usage (from repo root):
 *   node scripts/sync-swetrix-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const APPS = [
  { envKey: "SWETRIX_PROJECT_ID_INSTALLER", dir: "web/installer" },
  { envKey: "SWETRIX_PROJECT_ID_MARKETING", dir: "web/marketing" },
  { envKey: "SWETRIX_PROJECT_ID_DOCS", dir: "web/docs" },
  { envKey: "SWETRIX_PROJECT_ID_BRAND", dir: "web/brand-showcase" },
];

function loadRootEnv() {
  const env = { ...process.env };
  for (const rel of [".env"]) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function writeAppEnv(relDir, pid) {
  const abs = resolve(ROOT, relDir, ".env");
  const line = `VITE_SWETRIX_PROJECT_ID=${pid}\n`;
  if (existsSync(abs)) {
    const prev = readFileSync(abs, "utf8");
    if (/^VITE_SWETRIX_PROJECT_ID=/m.test(prev)) {
      writeFileSync(
        abs,
        prev.replace(/^VITE_SWETRIX_PROJECT_ID=.*$/m, `VITE_SWETRIX_PROJECT_ID=${pid}`),
      );
      return;
    }
    writeFileSync(abs, prev.endsWith("\n") ? `${prev}${line}` : `${prev}\n${line}`);
    return;
  }
  writeFileSync(abs, line);
}

const env = loadRootEnv();
let wrote = 0;
for (const app of APPS) {
  const pid = env[app.envKey]?.trim();
  if (!pid) {
    console.warn(`skip ${app.dir}: ${app.envKey} not set`);
    continue;
  }
  writeAppEnv(app.dir, pid);
  console.log(`${app.dir}/.env ← ${pid}`);
  wrote += 1;
}
if (wrote === 0) {
  console.error("No SWETRIX_PROJECT_ID_* values found in root .env or environment.");
  process.exit(1);
}
