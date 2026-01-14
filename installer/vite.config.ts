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
		setupFiles: "./tests/setup.ts",
		exclude: ["**/node_modules/**", "**/dist/**", "**/*.spec.ts"],
	},
});
