export const brandDictEn = {
	header: {
		switchToDe: "Switch to German",
		switchToEn: "Switch to English",
		language: "Language",
	},
	footer: {
		docs: "Docs",
		github: "GitHub",
		matrix: "Matrix",
		poweredBy: "Powered by",
		releaseNotes: "Release notes",
	},
	newsletter: {
		titleBefore: "Subscribe to the",
		titleHighlight: "update newsletters",
		body: "If you would like to be informed about software updates, you can subscribe to this newsletter.",
		placeholder: "your@email-address.iot",
		subscribe: "Subscribe",
	},
	a11y: {
		toggleColorMode: "Toggle color mode",
		muteSounds: "Mute sounds",
		unmuteSounds: "Unmute sounds",
		loading: "Loading",
		copyAppKey: "Copy appKey to clipboard",
		copiedAppKey: "Copied appKey",
		clearAppKey: "Clear appKey",
		showAppKey: "Show app key",
		hideAppKey: "Hide app key",
	},
	errors: {
		title: "Errors",
	},
	fileUploader: {
		selectFile: "Select file",
		clear: "Clear",
		selectedFiles: "Selected files:",
	},
} as const;

export type BrandDictionary = typeof brandDictEn;
