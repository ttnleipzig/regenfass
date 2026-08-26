import type { HomepageDictionary } from "./en.ts";

export const homepageDictDe: HomepageDictionary = {
	meta: {
		title: "regenfass – smarte Regenfass-Überwachung",
		description:
			"regenfass misst den Wasserstand in Regenfassern und Tanks und sendet Messwerte per LoRaWAN über The Things Network. Open-Source-IoT von TTN Leipzig.",
	},
	nav: {
		home: "Home",
		changelog: "Changelog",
		docs: "Docs",
		installer: "Installer",
		github: "GitHub",
	},
	hero: {
		headline: "Kenn den Wasserstand deines Regenfasses — kabellos.",
		body: "Open-Source-Füllstandmessung für Tanks und Fässer, über LoRaWAN und The Things Network — gebaut von TTN Leipzig.",
		ctaStart: "Loslegen",
		ctaDocs: "Docs lesen",
	},
	why: {
		title: "Warum das zählt",
		subtitle:
			"Praktische Gründe, einen Sensor an Fass oder Tank zu setzen.",
		items: [
			{
				title: "Regenfässer zu Hause",
				body: "Wisse, wie viel Wasser nach einer Trockenphase noch da ist — vor dem nächsten Gießen.",
			},
			{
				title: "Gemeinschaftsgärten",
				body: "Teile einen klaren Füllstand, damit alle fair und sparsam gießen können.",
			},
			{
				title: "Größere Tanks",
				body: "Überwache Zisternen und Speichertanks, ohne Deckel zu öffnen oder mit dem Messstab zu raten.",
			},
		],
	},
	how: {
		title: "So funktioniert’s",
		subtitle: "Von der Wasseroberfläche zum Dashboard, das du schon nutzt.",
		steps: [
			{
				step: "1",
				title: "Messen",
				body: "Ein Ultraschall- oder ToF-Sensor misst den Abstand zur Wasseroberfläche.",
			},
			{
				step: "2",
				title: "Rechnen",
				body: "Ein ESP32 wandelt den Abstand gerätenah in den Füllstand um.",
			},
			{
				step: "3",
				title: "Senden",
				body: "LoRaWAN überträgt kleine Payloads über große Distanzen mit wenig Energie.",
			},
			{
				step: "4",
				title: "Netzwerk",
				body: "The Things Network leitet Nachrichten an die Apps weiter, die du wählst.",
			},
			{
				step: "5",
				title: "Dashboard",
				body: "Sieh Trends in Grafana, Node-RED oder jedem MQTT-fähigen Tool.",
			},
		],
	},
	hardware: {
		title: "Hardware im Überblick",
		subtitle: "Eine kleine Teileliste, die viele Maker schon kennen.",
		items: [
			{
				title: "Heltec WiFi LoRa 32",
				body: "ESP32 mit eingebautem LoRa-Radio — flashen und konfigurieren im Browser.",
				src: "/img/hardware-esplora.svg",
			},
			{
				title: "HC-SR04 (und Co.)",
				body: "Günstige Ultraschallmessung für Prototypen; wasserdichte Optionen für längere Installationen.",
				src: "/img/sensor-hcsr04.svg",
			},
			{
				title: "Strom & Gehäuse",
				body: "Optionales OLED-Display, 18650-Zellen und ein wettertaugliches Gehäuse für draußen.",
				src: "/img/hardware-18650.svg",
			},
		],
		docsBefore: "Stückliste und Schaltpläne findest du in der",
		docsLink: "Dokumentation",
		docsAfter: ".",
	},
	software: {
		title: "Software, die du im Browser flashst",
		body: "Der Web-Installer nutzt Web Serial — für den ersten Flash brauchst du keine Desktop-IDE. Firmware und Installer sind Open Source unter der Projektlizenz auf GitHub.",
		openInstaller: "Installer öffnen",
		viewSource: "Quellcode auf GitHub",
		whatYouGet: "Was du bekommst",
		bullets: [
			"Flashen und Gerätekonfiguration im Browser",
			"LoRaWAN-OTAA-Zugangsdaten für The Things Network",
			"Anbindung an MQTT-, Node-RED- und Grafana-Stacks",
		],
	},
	cases: {
		title: "Typische Einsatzfälle",
		items: [
			{
				title: "Entscheidungen beim Gießen",
				body: "Weg mit dem Raten: öffne ein Diagramm und entscheide, ob heute gegossen wird.",
			},
			{
				title: "Hinweise bei Trockenheit",
				body: "Erkenne leere oder fast leere Tanks früh bei Hitzewellen und trockenen Wochen.",
			},
			{
				title: "Gemeinsame Sichtbarkeit",
				body: "Gib Kleingarten- oder Schulgarten-Gruppen eine gemeinsame Messquelle.",
			},
		],
	},
	changelog: {
		title: "Changelog",
		subtitle:
			"Dieselben Notizen wie auf GitHub Releases — geschrieben von Release Please aus Conventional Commits.",
		currentRelease: "Aktuelles Release:",
		openOnGitHub: "Auf GitHub öffnen",
	},
	cta: {
		title: "Bereit zum Messen?",
		body: "Flashe ein Board in Minuten, tritt The Things Network bei und lies dein Regenfass überall dort, wo Coverage ist.",
		ctaStart: "Loslegen",
		ctaDocs: "Docs lesen",
		betaTesters: "Beta-Tester:innen",
	},
	legal: {
		matrixLabel: "Im Matrix-Kanal kontaktieren",
		privacy: {
			title: "Datenschutzerklärung",
			intro: "Hier erklären wir in einfachen Worten, was mit deinen Daten passiert, wenn du regenfass nutzt.",
			sections: [
				{ title: "Wer ist verantwortlich?", body: "regenfass ist ein Open-Source-Projekt der TTN Leipzig user group. Projektkontakt ist André Lademan, Hardenbergstraße 48, 04275 Leipzig, Deutschland. Bei Fragen nutze bitte unseren Matrix-Kanal." },
				{ title: "Newsletter und Beta-Test", body: "Wenn du den Newsletter oder den Beta-Test abonnierst, verarbeiten wir deine E-Mail-Adresse, deinen optionalen Namen und die gewählte Sprache. Listmonk speichert diese Daten und sendet eine Bestätigungs-E-Mail. Erst nach Klick auf den Bestätigungslink wird die Anmeldung aktiv (Double-Opt-in). Du kannst dich jederzeit über den Link in einer E-Mail abmelden." },
				{ title: "So funktioniert das Dashboard", body: "Das Dashboard zeigt Sensordaten deines regenfass-Geräts, zum Beispiel Wasserstand, Zeitpunkte, Gerätekennungen und Verbindungsinformationen. Wir verarbeiten diese Daten, um Messwerte und Entwicklungen anzuzeigen. Zugriffstoken oder Abonnements ordnen Messungen der richtigen Dashboard-Ansicht zu. Sende nur Daten, die du für deine Überwachung brauchst." },
				{ title: "Beteiligte Dienste", body: "Homepage und Anmelde-Endpunkte werden von Netlify gehostet. Newsletter- und Beta-Anmeldungen verwalten wir in unserer selbst betriebenen Listmonk-Instanz; E-Mails werden über den konfigurierten SMTP-Anbieter versendet. Dashboard-Daten verarbeitet der regenfass-Dashboard-Dienst. Die Dienste erhalten nur die für ihren Zweck nötigen Daten." },
				{ title: "Deine Rechte", body: "Eine E-Mail-Adresse ist freiwillig, aber für Newsletter oder Beta-Test erforderlich. Du kannst Auskunft, Berichtigung, Löschung oder Einschränkung deiner Daten verlangen oder deine Einwilligung widerrufen. Wende dich dafür an das Projekt. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf bleibt unberührt." },
			],
		},
		imprint: {
			title: "Impressum",
			intro: "Angaben zum Anbieter der regenfass-Projektwebsite.",
			sections: [
				{ title: "Anbieter", body: "TTN Leipzig user group\nVertreten durch André Lademan\nHardenbergstraße 48\n04275 Leipzig\nDeutschland" },
				{ title: "Kontakt", body: "Bei Fragen zu regenfass nutze bitte unseren Matrix-Kanal." },
				{ title: "Verantwortung für das Projekt", body: "regenfass ist ein Open-Source-IoT-Projekt zur Messung von Wasserständen in Regenfässern und Tanks. Der Quellcode ist unter github.com/ttnleipzig/regenfass verfügbar." },
			],
		},
	},
};
