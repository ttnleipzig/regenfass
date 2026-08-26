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
    await expect(page.locator("main h1").first()).toHaveText(component.name);
    await expect(page.getByText("Unknown playground component.")).not.toBeVisible();
  });
}

test("component search filters the sidebar", async ({ page }) => {
  await page.goto("/button");
  await page.getByPlaceholder("Search components…").fill("Button");
  await expect(page.getByRole("link", { name: "Button", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "ButtonToggleMode", exact: true })).toBeVisible();
});

test("persists open category state in localStorage", async ({ page }) => {
  await page.goto("/button");
  await page.evaluate(() => localStorage.removeItem("regenfass-playground-open-categories"));
  await page.reload();

  const atomsCategory = page.getByRole("button", { name: /^Atoms/ });
  await expect(atomsCategory).toHaveAttribute("aria-expanded", "true");
  await atomsCategory.click();
  await expect(atomsCategory).toHaveAttribute("aria-expanded", "false");

  await page.reload();
  await expect(page.getByRole("button", { name: /^Atoms/ })).toHaveAttribute("aria-expanded", "false");

  await page.getByRole("button", { name: /^Atoms/ }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /^Atoms/ })).toHaveAttribute("aria-expanded", "true");
});

test("Button exposes semantic variants and loading state", async ({ page }) => {
  await page.goto("/button");
  await page.getByLabel("Variant").selectOption("secondary");
  await page.getByLabel("Loading").check();
  const previewButton = page.locator("main button").filter({ hasText: "Click me" });
  await expect(previewButton).toHaveClass(/border-secondary/);
  await expect(previewButton).toBeDisabled();
  await expect(page.locator("code.tokenized-code")).toContainText('variant={"secondary"}');
  await expect(page.locator("code.tokenized-code")).toContainText("loading={true}");
});

test("tokens route shows brand colors and fonts", async ({ page }) => {
  await page.goto("/tokens");
  await expect(page.locator("main h1")).toHaveText("Design tokens");
  await expect(page.getByRole("link", { name: "Tokens", exact: true })).toBeVisible();
  await expect(page.getByText("--primary", { exact: true })).toBeVisible();
  await expect(page.getByText("--primary-foreground", { exact: true })).toBeVisible();
  await expect(page.getByText("font-sans", { exact: true })).toBeVisible();
  await expect(page.getByText("font-mono", { exact: true })).toBeVisible();
  await expect(page.locator('[data-token-swatch="--primary-light"]')).toBeVisible();
  await expect(page.locator('[data-token-swatch="--primary-dark"]')).toBeVisible();
});

test("TextInput exposes and applies the disabled prop", async ({ page }) => {
  await page.goto("/text-input");
  await expect(page.getByLabel("Disabled")).toBeVisible();
  await page.getByLabel("Disabled").check();
  await expect(page.locator("pre")).toContainText("disabled={true}");
});

test("TextFieldHex shows actions, sound control, and selected props", async ({ page }) => {
  await page.goto("/text-field-hex");
  await expect(page.getByRole("button", { name: /(?:Unmute|Mute) sounds/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy appKey to clipboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear appKey" })).toBeVisible();
  await expect(page.locator("pre")).toContainText('showCopyButton={true}');
  await expect(page.locator("pre")).toContainText('showResetButton={true}');
});

test("Footer displays a release version and links to release notes", async ({ page }) => {
  await page.goto("/footer");
  await expect(page.getByText(/^v\d+\.\d+\.\d+$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Release notes" })).toHaveAttribute(
    "href",
    "https://github.com/ttnleipzig/regenfass/releases",
  );
});

test("Header exposes an optional title suffix", async ({ page }) => {
  await page.goto("/header");
  await page.getByLabel("Title suffix").fill("Docs");

  const heading = page.locator("main h1").last();
  await expect(heading).toContainText("regenfass");
  await expect(heading).toContainText("Docs");
  await expect(heading.locator("span")).toHaveClass(/font-normal/);
  await expect(heading.locator("span")).toHaveClass(/text-foreground\/80/);
  await expect(page.locator("code.tokenized-code")).toContainText('titleSuffix="Docs"');
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

test("ErrorList shows its title and errors in generated JSX", async ({ page }) => {
  await page.goto("/error-list");
  const code = page.locator("code.tokenized-code");

  await expect(code).toContainText('title="Please fix these issues"');
  await expect(code).toContainText('errors={["AppKey is required","Device is not connected"]}');
});
