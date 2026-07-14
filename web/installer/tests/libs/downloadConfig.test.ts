import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ConfigFileError,
	downloadConfigAsJson,
	parseConfigFileContent,
	readConfigFromFile,
} from "@/libs/downloadConfig.ts";

async function readBlobText(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsText(blob);
	});
}

describe("downloadConfigAsJson", () => {
	const config = {
		appEUI: "AAAABBBBCCCCDDDD",
		appKey: "0123456789ABCDEF0123456789ABCDEF",
		devEUI: "0123456789ABCDEF",
	};

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("creates a json blob and triggers download with default filename", () => {
		const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
		const revokeObjectURL = vi.fn();
		const click = vi.fn();

		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
		vi.spyOn(document, "createElement").mockReturnValue({
			href: "",
			download: "",
			click,
		} as unknown as HTMLAnchorElement);

		downloadConfigAsJson(config, 1);

		expect(createObjectURL).toHaveBeenCalledTimes(1);
		const blob = createObjectURL.mock.calls[0][0] as Blob;
		expect(blob.type).toBe("application/json");

		const anchor = document.createElement("a");
		expect(anchor.download).toBe("regenfass-config.json");
		expect(anchor.href).toBe("blob:mock-url");
		expect(click).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
	});

	it("serializes config with configVersion in the payload", async () => {
		const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
		const revokeObjectURL = vi.fn();

		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
		vi.spyOn(document, "createElement").mockReturnValue({
			href: "",
			download: "",
			click: vi.fn(),
		} as unknown as HTMLAnchorElement);

		downloadConfigAsJson(config, 1);

		const blob = createObjectURL.mock.calls[0][0] as Blob;
		const text = await readBlobText(blob);
		expect(JSON.parse(text)).toEqual({
			configVersion: 1,
			...config,
		});
	});

	it("omits configVersion when not provided", async () => {
		const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
		const revokeObjectURL = vi.fn();

		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
		vi.spyOn(document, "createElement").mockReturnValue({
			href: "",
			download: "",
			click: vi.fn(),
		} as unknown as HTMLAnchorElement);

		downloadConfigAsJson(config);

		const blob = createObjectURL.mock.calls[0][0] as Blob;
		const text = await readBlobText(blob);
		expect(JSON.parse(text)).toEqual(config);
	});

	it("uses a custom filename when provided", () => {
		const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
		const revokeObjectURL = vi.fn();

		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
		vi.spyOn(document, "createElement").mockReturnValue({
			href: "",
			download: "",
			click: vi.fn(),
		} as unknown as HTMLAnchorElement);

		downloadConfigAsJson(config, 1, "custom-config.json");

		const anchor = document.createElement("a");
		expect(anchor.download).toBe("custom-config.json");
	});
});

describe("parseConfigFileContent", () => {
	const validPayload = {
		configVersion: 1,
		appEUI: "aaaabbbbccccdddd",
		appKey: "0123456789abcdef0123456789abcdef",
		devEUI: "0123456789abcdef",
	};

	it("parses valid export payload with configVersion", () => {
		expect(parseConfigFileContent(JSON.stringify(validPayload))).toEqual({
			configVersion: 1,
			config: {
				appEUI: "AAAABBBBCCCCDDDD",
				appKey: "0123456789ABCDEF0123456789ABCDEF",
				devEUI: "0123456789ABCDEF",
			},
		});
	});

	it("parses credentials-only json without configVersion", () => {
		const { configVersion: _, ...credentialsOnly } = validPayload;
		expect(parseConfigFileContent(JSON.stringify(credentialsOnly))).toEqual({
			config: {
				appEUI: "AAAABBBBCCCCDDDD",
				appKey: "0123456789ABCDEF0123456789ABCDEF",
				devEUI: "0123456789ABCDEF",
			},
		});
	});

	it("ignores unknown extra keys", () => {
		expect(
			parseConfigFileContent(
				JSON.stringify({ ...validPayload, firmwareVersion: "1.0.0" })
			)
		).toEqual({
			configVersion: 1,
			config: {
				appEUI: "AAAABBBBCCCCDDDD",
				appKey: "0123456789ABCDEF0123456789ABCDEF",
				devEUI: "0123456789ABCDEF",
			},
		});
	});

	it("rejects invalid json", () => {
		expect(() => parseConfigFileContent("not json")).toThrow(ConfigFileError);
		expect(() => parseConfigFileContent("not json")).toThrow(
			"Invalid JSON format"
		);
	});

	it("rejects missing credential fields", () => {
		expect(() =>
			parseConfigFileContent(
				JSON.stringify({
					appEUI: "AAAABBBBCCCCDDDD",
					devEUI: "0123456789ABCDEF",
				})
			)
		).toThrow("Missing or invalid appKey");
	});

	it("rejects wrong hex lengths", () => {
		expect(() =>
			parseConfigFileContent(
				JSON.stringify({
					...validPayload,
					appEUI: "AAAA",
				})
			)
		).toThrow("appEUI must be 16 hex digits");
	});

	it("rejects unsupported configVersion", () => {
		expect(() =>
			parseConfigFileContent(
				JSON.stringify({
					...validPayload,
					configVersion: 99,
				})
			)
		).toThrow("Unsupported config version: 99");
	});
});

describe("readConfigFromFile", () => {
	it("reads and parses a json file", async () => {
		const file = new File(
			[
				JSON.stringify({
					configVersion: 1,
					appEUI: "AAAABBBBCCCCDDDD",
					appKey: "0123456789ABCDEF0123456789ABCDEF",
					devEUI: "0123456789ABCDEF",
				}),
			],
			"regenfass-config.json",
			{ type: "application/json" }
		);

		await expect(readConfigFromFile(file)).resolves.toEqual({
			configVersion: 1,
			config: {
				appEUI: "AAAABBBBCCCCDDDD",
				appKey: "0123456789ABCDEF0123456789ABCDEF",
				devEUI: "0123456789ABCDEF",
			},
		});
	});
});
