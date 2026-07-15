#!/usr/bin/env node
/**
 * Provision Swetrix funnels (and optionally projects) via the Admin API
 * (same endpoints as mcp-swetrix admin tools).
 *
 * Prefers existing IDs from root `.env`:
 *   SWETRIX_PROJECT_ID_INSTALLER / _MARKETING / _DOCS / _BRAND
 *
 * Usage (from repo root):
 *   node scripts/provision-swetrix.mjs
 *
 * Requires SWETRIX_API_KEY for Admin API calls. Always runs
 * scripts/sync-swetrix-env.mjs afterwards when IDs are present.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadRootEnv() {
  const env = { ...process.env };
  const p = resolve(ROOT, ".env");
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const rootEnvEarly = loadRootEnv();
const BASE =
  rootEnvEarly.SWETRIX_BASE_URL?.trim() ||
  process.env.SWETRIX_BASE_URL?.trim() ||
  "https://api.swetrix.com";

function loadApiKey(env) {
  const key = env.SWETRIX_API_KEY?.trim();
  if (!key) throw new Error("SWETRIX_API_KEY not found in env or .env");
  return key;
}

async function api(method, path, body, apiKey) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`Swetrix ${method} ${path} failed: ${res.status} ${text}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const PROJECTS = [
  {
    name: "regenfass-installer",
    envKey: "SWETRIX_PROJECT_ID_INSTALLER",
    origins: ["install.regenfass.eu"],
  },
  {
    name: "regenfass-marketing",
    envKey: "SWETRIX_PROJECT_ID_MARKETING",
    origins: ["regenfass.eu"],
  },
  {
    name: "regenfass-docs",
    envKey: "SWETRIX_PROJECT_ID_DOCS",
    origins: ["docs.regenfass.eu"],
  },
  {
    name: "regenfass-brand",
    envKey: "SWETRIX_PROJECT_ID_BRAND",
    origins: ["brand.regenfass.eu"],
  },
];

const INSTALLER_FUNNEL_STEPS = [
  "installer_state_Start_WaitingForUser",
  "installer_state_Connect_Connecting",
  "installer_state_Connect_ReadingVersion",
  "installer_state_Install_WaitingForInstallationMethodChoice",
  "installer_state_Install_Installing",
  "installer_state_Install_MigratingConfiguration",
  "installer_state_Config_Editing",
  "installer_state_Config_WritingConfiguration",
  "installer_state_Finish_ShowingNextSteps",
];

function upsertRootEnv(keys) {
  const abs = resolve(ROOT, ".env");
  let text = existsSync(abs) ? readFileSync(abs, "utf8") : "";
  for (const [k, v] of Object.entries(keys)) {
    if (!v) continue;
    const line = `${k}=${v}`;
    if (new RegExp(`^${k}=`, "m").test(text)) {
      text = text.replace(new RegExp(`^${k}=.*$`, "m"), line);
    } else {
      text = text.endsWith("\n") || text === "" ? `${text}${line}\n` : `${text}\n${line}\n`;
    }
  }
  writeFileSync(abs, text);
}

function projectIdOf(row) {
  return row?.id ?? row?.pid ?? row?.projectId;
}

async function ensureProject(apiKey, name, origins, existingId) {
  if (existingId) {
    console.log(`use existing project ${name} → ${existingId}`);
    return existingId;
  }
  const list = await api("GET", "/v1/project", undefined, apiKey);
  const rows = Array.isArray(list) ? list : list?.results ?? list?.data ?? [];
  const existing = rows.find((p) => p?.name === name);
  if (existing) {
    const id = projectIdOf(existing);
    console.log(`reuse project ${name} → ${id}`);
    return id;
  }
  const created = await api("POST", "/v1/project", { name }, apiKey);
  const id = projectIdOf(created);
  console.log(`created project ${name} → ${id}`);
  if (id && origins?.length) {
    try {
      await api("PUT", `/v1/project/${id}`, { name, origins }, apiKey);
    } catch {
      /* origins update best-effort */
    }
  }
  return id;
}

async function ensureFunnel(apiKey, pid, name, steps) {
  const list = await api("GET", `/v1/project/funnels/${pid}`, undefined, apiKey);
  const rows = Array.isArray(list) ? list : list?.results ?? list?.data ?? [];
  const existing = rows.find((f) => f?.name === name);
  if (existing) {
    console.log(`reuse funnel "${name}" on ${pid}`);
    return existing.id ?? existing.funnelId;
  }
  const created = await api(
    "POST",
    "/v1/project/funnel",
    { name, pid, steps },
    apiKey,
  );
  console.log(`created funnel "${name}" on ${pid}`);
  return created?.id ?? created?.funnelId;
}

async function main() {
  const env = loadRootEnv();
  const ids = {};
  const hasAllIds = PROJECTS.every((p) => env[p.envKey]?.trim());

  if (hasAllIds) {
    for (const p of PROJECTS) {
      ids[p.name] = env[p.envKey].trim();
      console.log(`from .env ${p.envKey}=${ids[p.name]}`);
    }
  } else {
    const apiKey = loadApiKey(env);
    for (const p of PROJECTS) {
      const id = await ensureProject(apiKey, p.name, p.origins, env[p.envKey]?.trim());
      if (!id) throw new Error(`No project id for ${p.name}`);
      ids[p.name] = id;
    }
    upsertRootEnv({
      SWETRIX_PROJECT_ID_INSTALLER: ids["regenfass-installer"],
      SWETRIX_PROJECT_ID_MARKETING: ids["regenfass-marketing"],
      SWETRIX_PROJECT_ID_DOCS: ids["regenfass-docs"],
      SWETRIX_PROJECT_ID_BRAND: ids["regenfass-brand"],
    });
  }

  try {
    const apiKey = loadApiKey(env);
    await ensureFunnel(
      apiKey,
      ids["regenfass-installer"],
      "Flash and configure",
      INSTALLER_FUNNEL_STEPS,
    );
    await ensureFunnel(apiKey, ids["regenfass-marketing"], "Path to documentation", [
      "/",
      "navigate_to_docs",
    ]);
    await ensureFunnel(apiKey, ids["regenfass-marketing"], "Path to installer", [
      "/",
      "navigate_to_installer",
    ]);
  } catch (err) {
    console.warn(`Funnel/Admin API step skipped: ${err.message || err}`);
    console.warn(
      "Create funnels in the Swetrix dashboard (see docs/Local-Development.md), or fix SWETRIX_API_KEY.",
    );
  }

  const sync = spawnSync(process.execPath, [resolve(ROOT, "scripts/sync-swetrix-env.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, ...env, ...Object.fromEntries(
      PROJECTS.map((p) => [p.envKey, ids[p.name]]),
    )},
  });
  if (sync.status !== 0) process.exit(sync.status || 1);

  console.log(JSON.stringify({ projects: ids }, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
