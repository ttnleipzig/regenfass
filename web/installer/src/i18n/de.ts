import type { InstallerDictionary } from "./en.ts";

export const installerDictDe: InstallerDictionary = {
	installationSteps: {
		connect:
			"Verbinde zuerst deinen Controller per USB, wähle den Gerätetyp und lies anschließend die Firmware-Version vom Gerät aus.",
		chooseMethod:
			"Wähle eine Firmware-Version aus der Liste und danach Installieren oder Konfigurieren.",
		flash: "Warte, während der Installer die Firmware auf dein Gerät schreibt.",
	},
	shared: {
		paginatorTitle: "Installation",
		paginatorListAriaLabel: "Installationsschritte",
		uploadProgress: "Upload-Fortschritt",
		progressPercent: "{{percent}} Prozent",
	},
	startCheckingWebSerialSupport: {
		title: "Web-Serial-Unterstützung wird geprüft",
		description: "Wir prüfen, ob dein Browser die Web Serial API unterstützt.",
	},
	startFetchUpstreamVersions: {
		title: "Versionen werden geladen",
		description: "Die neuesten verfügbaren Firmware-Versionen werden abgerufen.",
	},
	startWaitingForUser: {
		heading: "Hi! 👋",
		introBeforeTtn:
			"Dieses Projekt misst Wasserstände in Tanks und Fässern und sendet die Messwerte an einen Server. Zur Füllstandsmessung kann zum Beispiel ein HC-SR04-Ultraschallsensor verwendet werden; wir unterstützen verschiedene Sensoren und zeigen ihre Daten in einem Dashboard an. Die Daten gehen an",
		brandTheThingsNetwork: "The Things Network",
		introVia: "über ein",
		brandLoRaWAN: "LoRaWAN",
		introAfterLorawan: "Gateway.",
		alertTitle: "Um zu beginnen, bestätige die Verbindung",
		alertDescription: "Verbinde deinen Controller per USB und bestätige anschließend, um fortzufahren.",
		helpText: "Brauchst du Hilfe? Weitere Informationen findest du hier:",
		helpDocs: "Dokumentation",
		helpHomepage: "Homepage",
		helpMatrix: "Matrix-Channel",
		next: "Weiter",
	},
	connectConnecting: {
		title: "Verbindung wird hergestellt",
		description: "Es wird versucht, eine Verbindung zu deinem Gerät herzustellen.",
	},
	connectReadingVersion: {
		title: "Firmware-Version wird gelesen",
		description: "Geräteinformationen werden erfasst.",
	},
	installWaitingForInstallationMethodChoice: {
		alertTitle: "Installationsmethode wählen",
		alertDescription: "Frisch installieren oder vorhandene Firmware aktualisieren.",
		install: "Installieren",
		configure: "Konfigurieren",
		versionSelectPlaceholder: "Version auswählen",
	},
	installInstalling: {
		titleInProgress: "Firmware wird installiert",
		titleComplete: "Installation abgeschlossen",
		descriptionInProgress:
			"Die Firmware wird über USB auf den Mikrocontroller geschrieben — bitte lass das Kabel verbunden, bis der Vorgang fertig ist.",
		progressAriaLabel: "Fortschritt der Firmware-Installation",
		successTitle: "Installation erfolgreich",
		successBody: "Die Firmware wurde erfolgreich installiert.",
		successNext:
			"Als Nächstes folgt die Konfiguration. Du wirst gleich automatisch weitergeleitet.",
	},
	installMigratingConfiguration: {
		title: "Konfiguration wird migriert",
		description: "Deine Einstellungen bleiben erhalten.",
	},
	configEditing: {
		heading: "Geräte-Zugangsdaten",
		description:
			"Diese Werte identifizieren dein Gerät im Netzwerk. Nur Hex-Ziffern verwenden; der App-Key bleibt verborgen, bis du ihn anzeigst.",
		fieldAppEui: "appEUI",
		fieldDevEui: "devEUI",
		fieldAppKey: "appKey",
		copyToClipboard: "{{label}} in die Zwischenablage kopieren",
		copied: "{{label}} kopiert",
		clearField: "{{label}} löschen",
		importErrorTitle: "Konfiguration konnte nicht geladen werden",
		couldNotReadFile: "Die Konfigurationsdatei konnte nicht gelesen werden.",
		loadFromFileAriaLabel: "Konfiguration aus JSON-Datei laden",
		clear: "löschen",
		loadFromFile: "aus Datei laden",
		saveToFile: "in Datei speichern",
		saveToDevice: "Auf Gerät speichern",
	},
	configWritingConfiguration: {
		title: "Konfiguration wird geschrieben",
		description:
			"Deine Einstellungen werden über USB an den Mikrocontroller gesendet — bitte lass das Kabel verbunden, bis der Vorgang fertig ist.",
	},
	finishShowingNextSteps: {
		title: "Erfolg",
		body: "Alles erledigt. Du kannst dein Gerät jetzt nutzen.",
		anotherDevice:
			"Noch ein Gerät einrichten? Du kannst jederzeit eine neue Installation starten.",
		flashAnotherDevice: "Weiteres Gerät flashen",
	},
	finishShowingError: {
		title: "Kritischer Fehler",
		usbTitle: "USB-Verbindung fehlgeschlagen",
		usbDescription:
			"Es wurde kein Controller ausgewählt. Verbinde deinen Controller per USB, stelle sicher, dass er eingeschaltet ist, und versuche es erneut.",
		restart: "Neu starten",
	},
	stateErrors: {
		unsupportedBrowser: "Nicht unterstützter Browser",
		unknownConfigVersion:
			"Unbekannte Konfigurationsversion: {{configVersion}}, es ist kein Loader implementiert",
		migrateFailed:
			"Migration von {{fromVersion}} nach {{toVersion}} (Ziel {{desiredVersion}}) fehlgeschlagen: kein Handler für Konfigurationsformat v{{toVersion}} gefunden",
	},
	configFileErrors: {
		invalidJson: "Ungültiges JSON-Format",
		missingOrInvalidField: "Fehlendes oder ungültiges Feld {{field}}",
		appEuiLength: "appEUI muss 16 Hex-Ziffern haben",
		devEuiLength: "devEUI muss 16 Hex-Ziffern haben",
		appKeyLength: "appKey muss 32 Hex-Ziffern haben",
		configVersionMustBeNumber: "configVersion muss eine Zahl sein",
		unsupportedConfigVersion: "Nicht unterstützte Konfigurationsversion: {{version}}",
	},
};
