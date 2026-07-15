#!/usr/bin/env node
/**
 * Sync root `.env` Swetrix settings into each Vite app's `.env`.
 *
 * Expected root vars (no VITE_ prefix):
 *   SWETRIX_PROJECT_ID_INSTALLER / _MARKETING / _DOCS / _BRAND
 *   SWETRIX_API_URL (optional) — Events API log endpoint for the JS SDK
 *     Cloud: omit (defaults to https://api.swetrix.com/log)
 *     Self-hosted CE: https://your-host/backend/log
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

function upsertEnvFile(abs, entries) {
  let text = existsSync(abs) ? readFileSync(abs, "utf8") : "";
  for (const [k, v] of Object.entries(entries)) {
    if (v === undefined || v === null || v === "") {
      // Drop empty optional keys
      if (new RegExp(`^${k}=`, "m").test(text)) {
        text = text.replace(new RegExp(`^${k}=.*\\n?`, "m"), "");
      }
      continue;
    }
    const line = `${k}=${v}`;
    if (new RegExp(`^${k}=`, "m").test(text)) {
      text = text.replace(new RegExp(`^${k}=.*$`, "m"), line);
    } else {
      text = text.endsWith("\n") || text === "" ? `${text}${line}\n` : `${text}\n${line}\n`;
    }
  }
  writeFileSync(abs, text.endsWith("\n") || text === "" ? text : `${text}\n`);
}

const env = loadRootEnv();
const apiURL = env.SWETRIX_API_URL?.trim() || env.VITE_SWETRIX_API_URL?.trim() || "";
let wrote = 0;
for (const app of APPS) {
  const pid = env[app.envKey]?.trim();
  if (!pid) {
    console.warn(`skip ${app.dir}: ${app.envKey} not set`);
    continue;
  }
  const abs = resolve(ROOT, app.dir, ".env");
  upsertEnvFile(abs, {
    VITE_SWETRIX_PROJECT_ID: pid,
    VITE_SWETRIX_API_URL: apiURL,
  });
  console.log(`${app.dir}/.env ← pid=${pid}${apiURL ? ` api=${apiURL}` : ""}`);
  wrote += 1;
}
if (wrote === 0) {
  console.error("No SWETRIX_PROJECT_ID_* values found in root .env or environment.");
  process.exit(1);
}
