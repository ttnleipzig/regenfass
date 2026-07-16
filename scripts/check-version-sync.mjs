#!/usr/bin/env node
/**
 * Assert every surface carries the same product semver as
 * `.release-please-manifest.json` (".").
 *
 * Usage (from repo root):
 *   node scripts/check-version-sync.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const PACKAGE_JSON_PATHS = [
  "package.json",
  "web/brand/package.json",
  "web/brand-showcase/package.json",
  "web/installer/package.json",
  "web/marketing/package.json",
  "web/docs/package.json",
];

function read(relPath) {
  return readFileSync(resolve(ROOT, relPath), "utf8");
}

function extractQuotedConst(source, name) {
  const re = new RegExp(
    `(?:const|export const)\\s+${name}\\s*=\\s*"([^"]+)"`,
  );
  const match = source.match(re);
  if (!match) {
    throw new Error(`could not find ${name} string literal`);
  }
  return match[1];
}

function extractDefine(source, name) {
  const re = new RegExp(`#define\\s+${name}\\s+"([^"]+)"`);
  const match = source.match(re);
  if (!match) {
    throw new Error(`could not find #define ${name}`);
  }
  return match[1];
}

const errors = [];

try {
  const manifest = JSON.parse(read(".release-please-manifest.json"));
  const expected = manifest["."];
  if (typeof expected !== "string" || !expected) {
    throw new Error('manifest missing string version for "."');
  }

  console.log(`Expected version (manifest "."): ${expected}`);

  for (const rel of PACKAGE_JSON_PATHS) {
    const pkg = JSON.parse(read(rel));
    if (pkg.version !== expected) {
      errors.push(`${rel}: version "${pkg.version}" !== "${expected}"`);
    }
  }

  const appVersion = extractQuotedConst(
    read("web/brand/src/version.ts"),
    "APP_VERSION",
  );
  if (appVersion !== expected) {
    errors.push(
      `web/brand/src/version.ts: APP_VERSION "${appVersion}" !== "${expected}"`,
    );
  }

  const firmwareVersion = extractDefine(
    read("firmware/src/version.h"),
    "REGENFASS_VERSION",
  );
  if (firmwareVersion !== expected) {
    errors.push(
      `firmware/src/version.h: REGENFASS_VERSION "${firmwareVersion}" !== "${expected}"`,
    );
  }

  const dashboardVersion = extractQuotedConst(
    read("web/dashboard/internal/version/version.go"),
    "Version",
  );
  if (dashboardVersion !== expected) {
    errors.push(
      `web/dashboard/internal/version/version.go: Version "${dashboardVersion}" !== "${expected}"`,
    );
  }

  if (errors.length > 0) {
    console.error("Version sync check failed:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log("All version surfaces match the Release Please manifest.");
} catch (err) {
  console.error(`Version sync check error: ${err.message}`);
  process.exit(1);
}
