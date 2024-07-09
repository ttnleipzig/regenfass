// @ts-check
import {test, expect} from '@playwright/test'

test.describe('Footer', () => {
	test.beforeEach(async ({page}) => {
		await page.goto('http://localhost:3000')
	})

	test.describe('Has a newsletter section', () => {
		test('Has a newsletter section', async ({page}) => {
			await expect(page.locator('aside form')).toBeVisible()
		})

		// #newsletter contains text "Subscribe to the update newsletters"
		test('Has a newsletter title', async ({page}) => {
			await expect(page.locator('aside h2')).toBeVisible()
			await expect(page.locator('aside h2')).toHaveText('Subscribe to the update newsletters')
		})
		test('Has a newsletter input', async ({page}) => {
			await expect(page.locator('aside input')).toBeVisible()
			await expect(page.locator('aside input')).toHaveAttribute('type', 'email')
			await expect(page.locator('aside input')).toHaveAttribute('placeholder', 'your@email-address.iot')
		})
		test('Has a newsletter button', async ({page}) => {
			await expect(page.locator('aside button')).toBeVisible()
			await expect(page.locator('aside button')).toHaveAttribute('type', 'submit')
			await expect(page.locator('aside button')).toHaveText('Subscribe')
		})
	})

	test('Has a footer', async ({page}) => {
		await expect(page.locator('footer')).toBeVisible()
	})
	test('Has a the imprint', async ({page}) => {
		await expect(page.locator('footer address')).toBeVisible()
		await expect(page.locator('footer address')).toContainText('TTN Leipzig, André Lademan, Hardenbergstraße 48, 04275 Leipzig')
	})
	// Has link to esp web tools
	test('Has a link to esp web tools', async ({page}) => {
		await expect(page.locator('footer a')).toBeVisible()
		await expect(page.locator('footer a')).toHaveAttribute('href', 'https://esphome.github.io/esp-web-tools/')
		await expect(page.locator('footer a')).toHaveText('ESP Web Tools')
		await expect(page.locator('footer a')).toHaveAttribute('target', '_blank')
	})
})
