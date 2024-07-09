// @ts-check
import {test, expect} from '@playwright/test'

test.describe('Content', () => {
	test.beforeEach(async ({page}) => {
		await page.goto('http://localhost:3000')
	})

	test('Has a main tag inside body', async ({page}) => {
		await expect(page.locator('body main')).toBeVisible()
	})

	// section Welcome
	test.describe('Section: Welcome', () => {
		test('Has a welcome message', async ({page}) => {
			await expect(page.getByRole('heading', {name: 'Hi there!'})).toBeVisible()
		})
	})

	// Section Installation & Configuration
	test.describe('Section: Installation & configuration', () => {
		test('Has a heading', async ({page}) => {
			await expect(page.getByRole('heading', {name: 'Installation & configuration'})).toBeVisible()
		})
		test('Has a h2 tag', async ({page}) => {
			await expect(page.locator('main section:nth-child(2) h2')).toBeVisible()
		})
		test.describe('Step 1: Installation', () => {
			test('Has a details summary', async ({page}) => {
				await expect(page.locator('#step-installation summary')).toBeVisible()
				await expect(page.locator('#step-installation summary')).toContainText('1. Installation')
			})

			// On clicking the summary, the details element should be visible
			test('Has a details element which reacts on click', async ({page}) => {
				await page.locator('#step-installation summary').click()
				await expect(page.locator('#step-installation details')).toBeHidden()
			})

			// Section contains "Connect your microcontroller with an USB cable to your computer."
			test('Has a details element with a ordered list', async ({page}) => {
				await expect(page.locator('#step-installation details ol')).toBeDefined()
			})
		})
	})
})
