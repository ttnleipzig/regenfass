export type BrandDictionary = {
	header: {
		switchToDe: string;
		switchToEn: string;
		language: string;
	};
	footer: {
		docs: string;
		github: string;
		matrix: string;
		poweredBy: string;
		releaseNotes: string;
	};
	newsletter: {
		titleBefore: string;
		titleHighlight: string;
		body: string;
		placeholder: string;
		subscribe: string;
	};
	a11y: {
		toggleColorMode: string;
		muteSounds: string;
		unmuteSounds: string;
		loading: string;
		copyAppKey: string;
		copiedAppKey: string;
		clearAppKey: string;
		showAppKey: string;
		hideAppKey: string;
	};
	errors: {
		title: string;
	};
	fileUploader: {
		selectFile: string;
		clear: string;
		selectedFiles: string;
	};
};

export const brandDictEn: BrandDictionary = {
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
};
