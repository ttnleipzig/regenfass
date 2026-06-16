import type { Config } from "@/libs/install/config.ts";

export type ConfigExportPayload = Config & {
	configVersion?: number;
};

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
