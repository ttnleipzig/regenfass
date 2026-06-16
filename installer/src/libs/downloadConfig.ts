import {
	CONFIG_VERSIONS,
	type Config,
} from "@/libs/install/config.ts";
import { normalizeAppKeyHexInput } from "@/libs/hexKeyDisplay.ts";

export type ConfigExportPayload = Config & {
	configVersion?: number;
};

export class ConfigFileError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConfigFileError";
	}
}

function normalizeHexField(raw: string, length: number): string {
	const digits = raw.match(/[0-9A-Fa-f]/g)?.join("") ?? "";
	return digits.slice(0, length).toUpperCase();
}

function requireStringField(
	data: Record<string, unknown>,
	field: keyof Config
): string {
	const value = data[field];
	if (typeof value !== "string") {
		throw new ConfigFileError(`Missing or invalid ${field}`);
	}
	return value;
}

/** Parse JSON exported by downloadConfigAsJson (or compatible credential-only files). */
export function parseConfigFileContent(text: string): {
	config: Config;
	configVersion?: number;
} {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new ConfigFileError("Invalid JSON format");
	}

	if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new ConfigFileError("Invalid JSON format");
	}

	const data = parsed as Record<string, unknown>;

	const appEUI = normalizeHexField(requireStringField(data, "appEUI"), 16);
	const devEUI = normalizeHexField(requireStringField(data, "devEUI"), 16);
	const appKey = normalizeAppKeyHexInput(requireStringField(data, "appKey")).toUpperCase();

	if (appEUI.length !== 16) {
		throw new ConfigFileError("appEUI must be 16 hex digits");
	}
	if (devEUI.length !== 16) {
		throw new ConfigFileError("devEUI must be 16 hex digits");
	}
	if (appKey.length !== 32) {
		throw new ConfigFileError("appKey must be 32 hex digits");
	}

	let configVersion: number | undefined;
	if ("configVersion" in data && data.configVersion != null) {
		if (typeof data.configVersion !== "number") {
			throw new ConfigFileError("configVersion must be a number");
		}
		const supported = CONFIG_VERSIONS.some(
			(version) => version.version === data.configVersion
		);
		if (!supported) {
			throw new ConfigFileError(
				`Unsupported config version: ${data.configVersion}`
			);
		}
		configVersion = data.configVersion;
	}

	return {
		config: { appEUI, appKey, devEUI },
		...(configVersion != null ? { configVersion } : {}),
	};
}

/** Read and parse a JSON configuration file selected by the user. */
export async function readConfigFromFile(
	file: File
): Promise<{ config: Config; configVersion?: number }> {
	const text = await readFileAsText(file);
	return parseConfigFileContent(text);
}

async function readFileAsText(file: File): Promise<string> {
	if (typeof file.text === "function") {
		return file.text();
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}

/** Trigger a browser download of the given config as a JSON file. */
export function downloadConfigAsJson(
	config: Config,
	configVersion?: number,
	filename = "regenfass-config.json"
): void {
	const payload: ConfigExportPayload = {
		...config,
		...(configVersion != null ? { configVersion } : {}),
	};

	const dataStr = JSON.stringify(payload, null, 2);
	const blob = new Blob([dataStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();

	URL.revokeObjectURL(url);
}
