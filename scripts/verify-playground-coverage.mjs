#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const componentsRoot = resolve(root, "web/brand/src/components");
const registryPath = resolve(root, "web/playground/src/playground/data.tsx");
const registry = readFileSync(registryPath, "utf8");

function componentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return componentFiles(path);
    return entry.name.endsWith(".tsx") ? [basename(entry.name, ".tsx")] : [];
  });
}

const sharedComponents = componentFiles(componentsRoot);
const demos = [...registry.matchAll(/\n    name: "([^"]+)"/g)].map((match) => match[1]);
const slugs = [...registry.matchAll(/\n    slug: "([^"]+)"/g)].map((match) => match[1]);
const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
const missing = sharedComponents.filter((component) => !demos.includes(component));
const duplicateDemos = demos.filter((demo, index) => demos.indexOf(demo) !== index);

if (missing.length || duplicateSlugs.length || duplicateDemos.length) {
  if (missing.length) console.error(`Missing demos: ${missing.join(", ")}`);
  if (duplicateSlugs.length) console.error(`Duplicate slugs: ${duplicateSlugs.join(", ")}`);
  if (duplicateDemos.length) console.error(`Duplicate demos: ${duplicateDemos.join(", ")}`);
  process.exit(1);
}

console.log(`Playground coverage OK: ${sharedComponents.length} shared components, ${demos.length} demos.`);
