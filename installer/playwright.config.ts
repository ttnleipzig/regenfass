import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	testMatch: '**/*.spec.{js,ts}',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html', { open: 'never' }],
		['json', { outputFile: 'report.json' }],
		['junit', { outputFile: 'report.xml' }],
		['line'],
	],
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		video: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'pnpm dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
	},
});
