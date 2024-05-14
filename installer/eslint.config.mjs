import globals from "globals"
import pluginJs from "@eslint/js"

export default [
	{
		languageOptions: {
			globals: globals.browser
		},
		rules: {
			'quotes': ['error', 'single']
		},
		files: [
			'public/js/**/*.{js|mjs}',
		],
		ignores: ['tailwind.config.js']
	},
	pluginJs.configs.recommended,
]
