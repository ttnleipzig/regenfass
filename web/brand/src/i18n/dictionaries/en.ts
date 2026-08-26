export type BrandDictionary = {
	header: {
		switchToDe: string;
		switchToEn: string;
		language: string;
		alphaLabel: string;
		alphaTooltip: string;
		alphaCta: string;
	};
	footer: {
		docs: string;
		github: string;
		matrix: string;
		releaseNotes: string;
		privacy: string;
		imprint: string;
	};
	newsletter: {
		titleBefore: string;
		titleHighlight: string;
		body: string;
		placeholder: string;
		namePlaceholder: string;
		listLabel: string;
		subscribe: string;
		successTitle: string;
		successBodyBefore: string;
		successBodyAfter: string;
		error: string;
	};
	betaTester: {
		titleBefore: string;
		titleHighlight: string;
		body: string;
		namePlaceholder: string;
		placeholder: string;
		subscribe: string;
		successTitle: string;
		successBodyBefore: string;
		successBodyAfter: string;
		error: string;
		processTitle: string;
		processSteps: string[];
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
		alphaLabel: "Alpha version",
		alphaTooltip: "This software is in an early stage of development.",
		alphaCta: "Become a beta tester",
	},
	footer: {
		docs: "Docs",
		github: "GitHub",
		matrix: "Matrix",
		releaseNotes: "Release notes",
		privacy: "Privacy",
		imprint: "Imprint",
	},
	newsletter: {
		titleBefore: "Subscribe to the",
		titleHighlight: "update newsletters",
		body: "If you would like to be informed about software updates, you can subscribe to this newsletter.",
		placeholder: "your@email-address.iot",
		namePlaceholder: "Name (optional)",
		listLabel: "regenfass News",
		subscribe: "Subscribe",
		successTitle: "Almost done",
		successBodyBefore:
			"We sent a confirmation email to",
		successBodyAfter:
			"Click the link in that email to finish your subscription.",
		error: "We couldn't complete the subscription. Please try again.",
	},
	betaTester: {
		titleBefore: "Join the",
		titleHighlight: "beta test",
		body: "regenfass is still in an early stage of development. Help shape it and get updates as a beta tester.",
		namePlaceholder: "Name (optional)",
		placeholder: "your@email-address.iot",
		subscribe: "Join the beta test",
		successTitle: "Almost done",
		successBodyBefore: "We sent a confirmation email to",
		successBodyAfter: "Click the link in that email to finish your registration.",
		error: "We couldn't complete the registration. Please try again.",
		processTitle: "How it works",
		processSteps: [
			"Sign up with your email address.",
			"Confirm your registration using the email we send you.",
			"Try new versions and share your feedback with us.",
		],
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
