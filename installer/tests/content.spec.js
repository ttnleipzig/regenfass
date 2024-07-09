// @ts-check
import {test, expect} from '@playwright/test'

test.describe('Content', () => {
	test.beforeEach(async ({page}) => {
		await page.goto('http://localhost:3000')
	})

	test('Has a main tag inside body', async ({page}) => {
		await expect(page.locator('body main')).toBeVisible()
	})
	test('Has a welcome message', async ({page}) => {
		await expect(page.getByRole('heading', {name: 'Hi there!'})).toBeVisible()
	})
})
