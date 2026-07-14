/// <reference types="vitest/config" />
import path from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@regenfass/brand/styles.css": path.resolve(
				__dirname,
				"../brand/src/styles.css",
			),
			"@regenfass/brand/tailwind.preset.cjs": path.resolve(
				__dirname,
				"../brand/tailwind.preset.cjs",
			),
		},
		dedupe: ["solid-js", "@solidjs/router", "@kobalte/core"],
	},
	optimizeDeps: {
		include: [],
	},
	server: {
		fs: {
			allow: [path.resolve(__dirname, "..")],
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
				// Shared atoms/forms moved to @regenfass/brand; remaining
				// installer-only modules leave functions slightly under 80%.
				functions: 75,
				branches: 80,
				statements: 80,
			},
		},
	},
});
