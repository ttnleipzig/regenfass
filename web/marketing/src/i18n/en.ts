export const marketingDictEn = {
	meta: {
		title: "Regenfass – smart rain barrel monitoring",
		description:
			"Regenfass measures water level in rain barrels and tanks, and sends readings over LoRaWAN via The Things Network. Open source IoT by TTN Leipzig.",
	},
	nav: {
		home: "Home",
		changelog: "Changelog",
		docs: "Docs",
		installer: "Installer",
		brand: "Brand",
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
	},
} as const;

export type MarketingDictionary = typeof marketingDictEn;
