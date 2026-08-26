export type HomepageDictionary = {
	meta: {
		title: string;
		description: string;
	};
	nav: {
		home: string;
		changelog: string;
		docs: string;
		installer: string;
		github: string;
	};
	hero: {
		headline: string;
		body: string;
		ctaStart: string;
		ctaDocs: string;
	};
	why: {
		title: string;
		subtitle: string;
		items: { title: string; body: string }[];
	};
	how: {
		title: string;
		subtitle: string;
		steps: { step: string; title: string; body: string }[];
	};
	hardware: {
		title: string;
		subtitle: string;
		items: { title: string; body: string; src: string }[];
		docsBefore: string;
		docsLink: string;
		docsAfter: string;
	};
	software: {
		title: string;
		body: string;
		openInstaller: string;
		viewSource: string;
		whatYouGet: string;
		bullets: string[];
	};
	cases: {
		title: string;
		items: { title: string; body: string }[];
	};
	changelog: {
		title: string;
		subtitle: string;
		currentRelease: string;
		openOnGitHub: string;
	};
	cta: {
		title: string;
		body: string;
		ctaStart: string;
		ctaDocs: string;
		betaTesters: string;
	};
	legal: {
		matrixLabel: string;
		privacy: { title: string; intro: string; sections: { title: string; body: string }[] };
		imprint: { title: string; intro: string; sections: { title: string; body: string }[] };
	};
};

export const homepageDictEn: HomepageDictionary = {
	meta: {
		title: "regenfass – smart rain barrel monitoring",
		description:
			"regenfass measures water level in rain barrels and tanks, and sends readings over LoRaWAN via The Things Network. Open source IoT by TTN Leipzig.",
	},
	nav: {
		home: "Home",
		changelog: "Changelog",
		docs: "Docs",
		installer: "Installer",
		github: "GitHub",
	},
	hero: {
		headline: "Know your rain barrel’s water level—wirelessly.",
		body: "Open-source fill-level sensing for tanks and barrels, over LoRaWAN and The Things Network—built by TTN Leipzig.",
		ctaStart: "Get started",
		ctaDocs: "Read docs",
	},
	why: {
		title: "Why it matters",
		subtitle: "Practical reasons people put a sensor on a barrel or tank.",
		items: [
			{
				title: "Home rain barrels",
				body: "Know how much water is left after a dry spell—before the next watering session.",
			},
			{
				title: "Community gardens",
				body: "Share a clear fill level with gardeners so everyone can water fairly and sparingly.",
			},
			{
				title: "Larger tanks",
				body: "Monitor cisterns and storage tanks without climbing lids or guessing from a dip stick.",
			},
		],
	},
	how: {
		title: "How it works",
		subtitle: "From the water surface to a dashboard you already use.",
		steps: [
			{
				step: "1",
				title: "Sense",
				body: "An ultrasonic or ToF sensor reads distance to the water surface.",
			},
			{
				step: "2",
				title: "Compute",
				body: "An ESP32 board converts distance into fill level on device.",
			},
			{
				step: "3",
				title: "Transmit",
				body: "LoRaWAN sends small payloads over long range with low power.",
			},
			{
				step: "4",
				title: "Network",
				body: "The Things Network routes messages to apps you choose.",
			},
			{
				step: "5",
				title: "Dashboard",
				body: "View trends in Grafana, Node-RED, or any MQTT-ready tool.",
			},
		],
	},
	hardware: {
		title: "Hardware overview",
		subtitle: "A small parts list most makers already recognize.",
		items: [
			{
				title: "Heltec WiFi LoRa 32",
				body: "ESP32 with onboard LoRa radio—flash and configure from the browser.",
				src: "/img/hardware-esplora.svg",
			},
			{
				title: "HC-SR04 (and friends)",
				body: "Affordable ultrasonic sensing for prototypes; waterproof options for longer installs.",
				src: "/img/sensor-hcsr04.svg",
			},
			{
				title: "Power & housing",
				body: "Optional OLED display, 18650 cells, and a weather-minded enclosure for outdoor use.",
				src: "/img/hardware-18650.svg",
			},
		],
		docsBefore: "Full bill of materials and wiring diagrams live in the",
		docsLink: "documentation",
		docsAfter: ".",
	},
	software: {
		title: "Software you flash in the browser",
		body: "The web installer uses Web Serial—no desktop IDE required for a first flash. Firmware and the installer are open source under the project’s license on GitHub.",
		openInstaller: "Open installer",
		viewSource: "View source on GitHub",
		whatYouGet: "What you get",
		bullets: [
			"Browser-based flashing and device configuration",
			"LoRaWAN OTAA credentials for The Things Network",
			"Hooks into MQTT, Node-RED, and Grafana stacks",
		],
	},
	cases: {
		title: "Typical use cases",
		items: [
			{
				title: "Garden watering decisions",
				body: "Skip the guesswork: open a chart and decide whether to irrigate today.",
			},
			{
				title: "Seasonal dryness alerts",
				body: "Catch empty or near-empty tanks early during heatwaves and dry weeks.",
			},
			{
				title: "Shared site visibility",
				body: "Give allotment or school garden groups one shared reading source.",
			},
		],
	},
	changelog: {
		title: "Changelog",
		subtitle:
			"Same notes as on GitHub Releases — written by Release Please from Conventional Commits.",
		currentRelease: "Current release:",
		openOnGitHub: "Open on GitHub",
	},
	cta: {
		title: "Ready to measure?",
		body: "Flash a board in minutes, join The Things Network, and start reading your rain barrel from anywhere with coverage.",
		ctaStart: "Get started",
		ctaDocs: "Read the docs",
		betaTesters: "Beta testers",
	},
	legal: {
		privacy: {
			title: "Privacy policy",
			intro: "This page explains in simple terms what happens to your data when you use regenfass.",
			sections: [
				{ title: "Who is responsible?", body: "regenfass is an open-source project by the TTN Leipzig user group. The project contact is André Lademan, Hardenbergstraße 48, 04275 Leipzig, Germany. For questions, please use our Matrix channel." },
				{ title: "Newsletter and beta testing", body: "If you subscribe to the newsletter or beta test, we process your email address, your optional name, and the selected language. Listmonk stores this information and sends a confirmation email. Your subscription only becomes active after you click the confirmation link (double opt-in). You can unsubscribe at any time using the link in an email." },
				{ title: "How the dashboard works", body: "The dashboard displays sensor data sent by your regenfass device, such as water level, timestamps, device identifiers, and connection information. We process this data to show measurements and trends. Access tokens or subscriptions are used to associate readings with the right dashboard view. Only send data you need for your own monitoring." },
				{ title: "Services involved", body: "The homepage and subscription endpoints are hosted by Netlify. Newsletter and beta subscriptions are managed in our self-hosted Listmonk instance; emails are delivered through the configured SMTP provider. Dashboard data is handled by the regenfass dashboard service. These services receive only the data needed for their stated purpose." },
				{ title: "Your choices", body: "Providing an email address is voluntary, but it is required for a newsletter or beta subscription. You can request information, correction, deletion, or restriction of your data, or withdraw your consent, by contacting the project. This does not affect processing that was lawful before withdrawal." },
			],
		},
		imprint: {
			title: "Imprint",
			intro: "Information about the provider of the regenfass project website.",
			sections: [
				{ title: "Provider", body: "TTN Leipzig user group\nRepresented by André Lademan\nHardenbergstraße 48\n04275 Leipzig\nGermany" },
				{ title: "Contact", body: "For questions about regenfass, please use our Matrix channel." },
				{ title: "Project responsibility", body: "regenfass is an open-source IoT project for measuring water levels in rain barrels and tanks. The source code is available at github.com/ttnleipzig/regenfass." },
			],
		},
		matrixLabel: "Contact us in Matrix",
	},
};
