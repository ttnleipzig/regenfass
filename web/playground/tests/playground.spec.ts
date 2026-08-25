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

test("AppKeyHexField shows actions, sound control, and selected props", async ({ page }) => {
  await page.goto("/app-key-hex-field");
  await expect(page.getByRole("button", { name: /(?:Unmute|Mute) sounds/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy appKey to clipboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear appKey" })).toBeVisible();
  await expect(page.locator("pre")).toContainText('showCopyButton={true}');
  await expect(page.locator("pre")).toContainText('showResetButton={true}');
});

test("Footer displays a release version and links to release notes", async ({ page }) => {
  await page.goto("/footer");
  await expect(page.getByText(/^v\\d+\\.\\d+\\.\\d+$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Release notes" })).toHaveAttribute(
    "href",
    "https://github.com/ttnleipzig/regenfass/releases",
  );
});

test("Progress shows the current value in generated JSX", async ({ page }) => {
  await page.goto("/progress");
  await page.getByLabel("Value").fill("72");
  await expect(page.locator("code.tokenized-code")).toContainText("value={72}");
});

test("Spinner shows the selected size in generated JSX", async ({ page }) => {
  await page.goto("/spinner");
  await page.getByLabel("Size").selectOption("lg");
  await expect(page.locator("code.tokenized-code")).toContainText('size="lg"');
});

test("Status shows the selected state in generated JSX", async ({ page }) => {
  await page.goto("/status");
  await page.getByLabel("Status").selectOption("error");
  await expect(page.locator("code.tokenized-code")).toContainText('status="error"');
  await expect(page.locator("code.tokenized-code")).toContainText('message="Connected"');
});

test("AlertDialog exposes content props and opens with the configured text", async ({ page }) => {
  await page.goto("/alert-dialog");
  await page.getByLabel("Title").fill("Remove this device?");
  await expect(page.locator("code.tokenized-code")).toContainText("Remove this device?");
  await page.getByRole("button", { name: "Delete device" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByRole("alertdialog")).toContainText("Remove this device?");
});
