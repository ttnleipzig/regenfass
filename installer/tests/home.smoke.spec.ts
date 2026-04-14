import { expect, test } from '@playwright/test';

test.describe('installer home', () => {
	test('has main landmark, title, and primary heading', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Regenfass.*installer/i);
		await expect(page.locator('body main')).toBeVisible();
		await expect(
			page.getByRole('heading', { level: 1, name: 'Regenfass' }),
		).toBeVisible();
	});
});
