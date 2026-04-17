/// <reference types="vitest/config" />
import path from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./tests/setup.ts",
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/*.spec.ts",
			// Playwright E2E — run with `pnpm exec playwright test`, not Vitest
			"**/*.spec.js",
			// Legacy form specs expect full German installer forms (not the thin stubs in src/installer/forms)
			"**/StepStartWaitingForUserForm.test.tsx",
			"**/StepConfigEditingForm.test.tsx",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"tests/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/coverage/**",
				// Build output — not source code
				"dist/**",
				// Static public assets and legacy JS files
				"public/**",
				// Build/codegen scripts — not shipped
				"scripts/**",
				// Playground is a dev tool, not production code
				"src/playground/**",
				// SCP is a shared firmware/serial library, exercised by E2E tests
				"src/libs/scp/**",
				// XState machine and WebSerial protocol — require hardware/E2E, not unit tests
				"src/libs/install/state.ts",
				"src/libs/install/scp.ts",
				// Pure type definitions — no logic to cover
				"src/installer/types.ts",
				"src/lib/**",
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
});
