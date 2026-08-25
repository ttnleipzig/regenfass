import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const registry = readFileSync(new URL("../src/playground/data.tsx", import.meta.url), "utf8");
const components = [...registry.matchAll(/\n    slug: "([^"]+)",\n    name: "([^"]+)"/g)].map((match) => ({
  slug: match[1],
  name: match[2],
}));

for (const component of components) {
  test(`${component.name} route renders`, async ({ page }) => {
    await page.goto(`/${component.slug}`);
    await expect(page.locator("main h1")).toHaveText(component.name);
    await expect(page.getByText("Unknown playground component.")).not.toBeVisible();
  });
}

test("component search filters the sidebar", async ({ page }) => {
  await page.goto("/button");
  await page.getByPlaceholder("Search components…").fill("ButtonPrimary");
  await expect(page.getByRole("link", { name: "ButtonPrimary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ButtonSecondary" })).not.toBeVisible();
});

test("TextInput exposes and applies the disabled prop", async ({ page }) => {
  await page.goto("/text-input");
  await expect(page.getByLabel("Disabled")).toBeVisible();
  await page.getByLabel("Disabled").check();
  await expect(page.locator("pre")).toContainText("disabled={true}");
});
