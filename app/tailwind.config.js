/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,html}",
	],
	theme: {
		extend: {
			colors: {
				secondaryDark: "#171A1A",
				primaryDark: "#090A0A",
				neonOrange: "#FF9933",
				redditRed: "#FF5700",
				cardGradientPrimary: "#ff930f",
				cardGradientSecondary: "#fff95b",
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [require("@tailwindcss/forms")],
}

