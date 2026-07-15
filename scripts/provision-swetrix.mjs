#!/usr/bin/env node
/**
 * Provision Swetrix projects and funnels via the Admin API
 * (same endpoints as mcp-swetrix admin tools).
 *
 * Usage (from repo root):
 *   node scripts/provision-swetrix.mjs
 *
 * Requires SWETRIX_API_KEY in the environment or /workspace/.env / .env.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE = process.env.SWETRIX_BASE_URL || "https://api.swetrix.com";

function loadApiKey() {
  if (process.env.SWETRIX_API_KEY?.trim()) return process.env.SWETRIX_API_KEY.trim();
  for (const rel of [".env", "web/.env"]) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    const m = text.match(/^SWETRIX_API_KEY=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("SWETRIX_API_KEY not found in env or .env");
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
    origins: ["install.regenfass.eu"],
    envPath: "web/installer/.env",
  },
  {
    name: "regenfass-marketing",
    origins: ["regenfass.eu"],
    envPath: "web/marketing/.env",
  },
  {
    name: "regenfass-docs",
    origins: ["docs.regenfass.eu"],
    envPath: "web/docs/.env",
  },
  {
    name: "regenfass-brand",
    origins: ["brand.regenfass.eu"],
    envPath: "web/brand-showcase/.env",
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

function writeEnvPid(relPath, pid) {
  const abs = resolve(ROOT, relPath);
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

function projectIdOf(row) {
  return row?.id ?? row?.pid ?? row?.projectId;
}

async function ensureProject(apiKey, name, origins) {
  const list = await api("GET", "/v1/project", undefined, apiKey);
  const rows = Array.isArray(list) ? list : list?.results ?? list?.data ?? [];
  const existing = rows.find((p) => p?.name === name);
  if (existing) {
    const id = projectIdOf(existing);
    console.log(`reuse project ${name} → ${id}`);
    if (origins?.length) {
      try {
        await api("PUT", `/v1/project/${id}`, { name, origins }, apiKey);
      } catch {
        /* origins update best-effort */
      }
    }
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
  const apiKey = loadApiKey();
  const ids = {};
  for (const p of PROJECTS) {
    const id = await ensureProject(apiKey, p.name, p.origins);
    if (!id) throw new Error(`No project id returned for ${p.name}`);
    ids[p.name] = id;
    writeEnvPid(p.envPath, id);
    console.log(`wrote ${p.envPath}`);
  }

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

  console.log(JSON.stringify({ projects: ids }, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
