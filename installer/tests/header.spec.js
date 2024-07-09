// @ts-check
import {test, expect} from '@playwright/test'

test.describe('Header', () => {
	test.beforeEach(async ({page}) => {
		await page.goto('http://localhost:3000')
	})

	test('Has a visible header', async ({page}) => {
		await expect(page.locator('header')).toBeVisible()
	})

	test.describe('Title', () => {
		test('Has a title', async ({page}) => {
			await expect(page.locator('header h1')).toBeVisible()
			await expect(page.locator('header h1')).toHaveText('regenfass')
		})
	})
	test.describe('Menu', () => {
		test('Has a nav tag inside header', async ({page}) => {
			await expect(page.locator('header nav')).toBeVisible()
		})
		test('Has a docs link in the menu', async ({page}) => {
			await expect(page.getByRole('link', {name: 'docs'})).toBeVisible()
			await expect(page.getByRole('link', {name: 'docs'})).toHaveAttribute('href', 'https://docs.regenfass.eu/')
		})

		test('Has a github link in the menu', async ({page}) => {
			await expect(page.getByRole('link', {name: 'github'})).toBeVisible()
			await expect(page.getByRole('link', {name: 'github'})).toHaveAttribute('href', 'https://github.com/ttnleipzig/regenfass')
		})

		test('Has a link to Matrix room in the menu', async ({page}) => {
			await expect(page.getByRole('link', {name: 'matrix'})).toBeVisible()
			await expect(page.getByRole('link', {name: 'matrix'})).toHaveAttribute('href', 'https://matrix.to/#/#ttn-leipzig:matrix.org')
		})

	})
})
