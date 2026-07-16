export type InstallerDictionary = {
	installationSteps: { connect: string; chooseMethod: string; flash: string };
	shared: {
		paginatorTitle: string;
		paginatorListAriaLabel: string;
		uploadProgress: string;
		progressPercent: string;
	};
	startCheckingWebSerialSupport: { title: string; description: string };
	startFetchUpstreamVersions: { title: string; description: string };
	startWaitingForUser: {
		heading: string;
		introBeforeTtn: string;
		brandTheThingsNetwork: string;
		introVia: string;
		brandLoRaWAN: string;
		introAfterLorawan: string;
		alertTitle: string;
		alertDescription: string;
		next: string;
	};
	connectConnecting: { title: string; description: string };
	connectReadingVersion: { title: string; description: string };
	installWaitingForInstallationMethodChoice: {
		alertTitle: string;
		alertDescription: string;
		install: string;
		configure: string;
		versionSelectPlaceholder: string;
	};
	installInstalling: {
		titleInProgress: string;
		titleComplete: string;
		descriptionInProgress: string;
		progressAriaLabel: string;
		successTitle: string;
		successBody: string;
		successNext: string;
	};
	installMigratingConfiguration: { title: string; description: string };
	configEditing: {
		heading: string;
		description: string;
		fieldAppEui: string;
		fieldDevEui: string;
		fieldAppKey: string;
		copyToClipboard: string;
		copied: string;
		clearField: string;
		importErrorTitle: string;
		couldNotReadFile: string;
		loadFromFileAriaLabel: string;
		clear: string;
		loadFromFile: string;
		saveToFile: string;
		saveToDevice: string;
	};
	configWritingConfiguration: { title: string; description: string };
	finishShowingNextSteps: {
		title: string;
		body: string;
		anotherDevice: string;
		flashAnotherDevice: string;
	};
	finishShowingError: { title: string; restart: string };
	stateErrors: {
		unsupportedBrowser: string;
		unknownConfigVersion: string;
		migrateFailed: string;
	};
	configFileErrors: {
		invalidJson: string;
		missingOrInvalidField: string;
		appEuiLength: string;
		devEuiLength: string;
		appKeyLength: string;
		configVersionMustBeNumber: string;
		unsupportedConfigVersion: string;
	};
};

export const installerDictEn: InstallerDictionary = {
	installationSteps: {
		connect:
			"Confirm to start, connect your board over USB, choose the device type, then read the firmware version from the device.",
		chooseMethod:
			"Pick a firmware version from the list, then choose Install or Configure.",
		flash: "Wait while the installer flashes firmware to your device.",
	},
	shared: {
		paginatorTitle: "Installation",
		paginatorListAriaLabel: "Installation steps",
		uploadProgress: "Upload progress",
		progressPercent: "{{percent}} percent",
	},
	startCheckingWebSerialSupport: {
		title: "Checking Web Serial support",
		description:
			"We are verifying that your browser supports the Web Serial API.",
	},
	startFetchUpstreamVersions: {
		title: "Fetching versions",
		description: "Getting the latest available firmware versions.",
	},
	startWaitingForUser: {
		heading: "Hi there! 👋",
		introBeforeTtn:
			"This project is about a smart water tank. It measures the water level and sends the data to a server. The server can be used to control the water pump. The pump can be controlled via a web interface or via a telegram bot. It uses an HC-SR04 ultrasonic sensor to measure the water level. The data is sent to",
		brandTheThingsNetwork: "The Things Network",
		introVia: "via a",
		brandLoRaWAN: "LoRaWAN",
		introAfterLorawan: "gateway.",
		alertTitle: "Waiting for your confirmation",
		alertDescription: "Please confirm to continue.",
		next: "Next",
	},
	connectConnecting: {
		title: "Connecting",
		description: "Trying to connect to your device.",
	},
	connectReadingVersion: {
		title: "Reading firmware version",
		description: "Gathering device information.",
	},
	installWaitingForInstallationMethodChoice: {
		alertTitle: "Choose installation method",
		alertDescription: "Install fresh or update existing firmware.",
		install: "Install",
		configure: "Configure",
		versionSelectPlaceholder: "Select a version",
	},
	installInstalling: {
		titleInProgress: "Installing firmware",
		titleComplete: "Installation complete",
		descriptionInProgress:
			"Firmware is being written to the microcontroller over USB—please keep the cable connected until this finishes.",
		progressAriaLabel: "Firmware installation progress",
		successTitle: "Installation successful",
		successBody: "The firmware was installed successfully.",
		successNext:
			"The next step is configuration. You will be taken there automatically in a moment.",
	},
	installMigratingConfiguration: {
		title: "Migrating configuration",
		description: "Keeping your settings safe.",
	},
	configEditing: {
		heading: "Device credentials",
		description:
			"These values identify your device on the network. Use hex digits only; the app key stays hidden until you choose to reveal it.",
		fieldAppEui: "appEUI",
		fieldDevEui: "devEUI",
		fieldAppKey: "appKey",
		copyToClipboard: "Copy {{label}} to clipboard",
		copied: "Copied {{label}}",
		clearField: "Clear {{label}}",
		importErrorTitle: "Could not load configuration",
		couldNotReadFile: "Could not read the configuration file.",
		loadFromFileAriaLabel: "Load configuration from JSON file",
		clear: "clear",
		loadFromFile: "load from file",
		saveToFile: "save to file",
		saveToDevice: "Save to device",
	},
	configWritingConfiguration: {
		title: "Writing configuration",
		description:
			"Your settings are being sent to the microcontroller over USB—please keep the cable connected until this finishes.",
	},
	finishShowingNextSteps: {
		title: "Success",
		body: "All set. You can now use your device.",
		anotherDevice:
			"Setting up another device? You can start a new installation whenever you are ready.",
		flashAnotherDevice: "Flash another device",
	},
	finishShowingError: {
		title: "Critical error",
		restart: "Restart",
	},
	stateErrors: {
		unsupportedBrowser: "Unsupported browser",
		unknownConfigVersion:
			"Unknown config version: {{configVersion}}, there is no loader implemented",
		migrateFailed:
			"Failed to migrate from {{fromVersion}} to {{toVersion}} (to get to {{desiredVersion}}), could not find handler for config format for v{{toVersion}}",
	},
	configFileErrors: {
		invalidJson: "Invalid JSON format",
		missingOrInvalidField: "Missing or invalid {{field}}",
		appEuiLength: "appEUI must be 16 hex digits",
		devEuiLength: "devEUI must be 16 hex digits",
		appKeyLength: "appKey must be 32 hex digits",
		configVersionMustBeNumber: "configVersion must be a number",
		unsupportedConfigVersion: "Unsupported config version: {{version}}",
	},
};
