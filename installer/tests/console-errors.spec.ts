import { test, expect } from '@playwright/test';

test('no console errors or warnings on load', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') errors.push(msg.text());
    if (type === 'warning') warnings.push(msg.text());
    if (type === 'error' || type === 'warning') {
      const loc = msg.location();
      // eslint-disable-next-line no-console
      console.log(`[console:${type}] ${msg.text()} @ ${loc.url}:${loc.lineNumber}:${loc.columnNumber}`);
    }
  });

  page.on('pageerror', err => {
    const text = String(err);
    errors.push(text);
    // eslint-disable-next-line no-console
    console.log(`[pageerror] ${text}`);
    if ((err as any)?.stack) {
      // eslint-disable-next-line no-console
      console.log(String((err as any).stack));
    }
  });

  await page.goto('/');
  // wait a tick for app to settle
  await page.waitForTimeout(300);

  expect(warnings, 'Console warnings found').toEqual([]);
  expect(errors, 'Console errors found').toEqual([]);
});


