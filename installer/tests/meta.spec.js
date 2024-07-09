// @ts-check
import {test, expect} from '@playwright/test'

test.describe('Meta', () => {
	test.beforeEach(async ({page}) => {
		await page.goto('http://localhost:3000')
	})

	test('Has the correct title tag', async ({page}) => {
		await expect(page).toHaveTitle(/regenfass - Installer/)
	})

	test('Has a description meta tag that has a maximum length of 180 chars and a minmum of 80 chars', async ({page}) => {
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', expect.stringMatching(/.{80,180}/))
	})

	test('Has a viewport tag', async ({page}) => {
		await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', expect.stringMatching('width=device-width, initial-scale=1'))
	})

	// author
	test('Has a author meta tag', async ({page}) => {
		await expect(page.locator('meta[name="author"]')).toHaveAttribute('content', expect.stringMatching('TTN Leipzig'))
	})

	// Favicon
	test('Has a favicon', async ({page}) => {
		await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', expect.stringMatching('favicon.ico'))
		await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/png')
	})

	// OpenGraph
	test('Has an opengraph title', async ({page}) => {
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', expect.stringMatching('regenfass - Installer'))
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', expect.stringMatching(/.{80,180}/))
		await expect(page.locator('meta[property="og:url"]')).toBeDefined()
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', expect.stringMatching('regenfass.png'))
		await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'regenfass')
	})

	// jsonld
	test('Has a jsonld title', async ({page}) => {
		await expect(page.locator('script[type="application/ld+json"]')).toBeDefined()
	})
})
