import { afterEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import {
	fetchFirmwareReleases,
	firmwareEnvironments,
	versionsForEnvironment,
	loadFirmwareFiles,
} from "@/libs/install/firmware";
import handler from "../../../netlify/functions/firmware.mjs";

afterEach(() => vi.unstubAllGlobals());

const environment = "heltec_wifi_lora_32_V3_HCSR04";

async function archive(pathPrefix = "", offset = "0x1000", missing?: string) {
	const zip = new JSZip();
	const images = ["bootloader.bin", "partitions.bin", "boot_app0.bin"];
	for (const name of [...images, "firmware.bin"]) {
		if (name !== missing) zip.file(name, `data:${name}`);
	}
	zip.file(
		"firmware_metadata.json",
		JSON.stringify({
			flash_images: images.map((name, index) => ({
				path: `${pathPrefix}${name}`,
				offset: index === 0 ? offset : ["", "0x8000", "0xe000"][index],
			})),
			application_offset: "0x10000",
		}),
	);
	return zip.generateAsync({ type: "arraybuffer" });
}

describe("firmware release artifacts", () => {
	it("lists exact tags only for stable releases with the matching board archive", async () => {
		const release = (tag: string, overrides = {}) => ({
			tag_name: tag,
			draft: false,
			prerelease: false,
			assets: [{ name: `regenfass-${tag}-${environment}.zip` }],
			...overrides,
		});
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => [
					release("v1.2.3"),
					release("1.2.2"),
					release("1.2.1", { assets: [] }),
					release("draft", { draft: true }),
					release("preview", { prerelease: true }),
					release("other-board", {
						assets: [
							{
								name: "regenfass-other-board-az-delivery-devkit-v4_HCSR04.zip",
							},
						],
					}),
				],
			}),
		);
		expect(await fetchFirmwareReleases()).toEqual([
			{ version: "v1.2.3", environments: [environment] },
			{ version: "1.2.2", environments: [environment] },
			{
				version: "other-board",
				environments: ["az-delivery-devkit-v4_HCSR04"],
			},
		]);
	});

	it.each(["", "/home/runner/.platformio/"])(
		"loads all flash images with metadata prefix %j",
		async (prefix) => {
			const data = await archive(prefix);
			const fetchMock = vi
				.fn()
				.mockResolvedValue({ ok: true, arrayBuffer: async () => data });
			vi.stubGlobal("fetch", fetchMock);
			const files = await loadFirmwareFiles("v1.2.3", environment);
			expect(fetchMock).toHaveBeenCalledWith(`/firmware/v1.2.3/${environment}`);
			expect(files).toEqual([
				{ data: "data:bootloader.bin", address: 0x1000 },
				{ data: "data:partitions.bin", address: 0x8000 },
				{ data: "data:boot_app0.bin", address: 0xe000 },
				{ data: "data:firmware.bin", address: 0x10000 },
			]);
		},
	);

	it("rejects old archives without metadata", async () => {
		const data = await new JSZip().generateAsync({ type: "arraybuffer" });
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => data }),
		);
		await expect(loadFirmwareFiles("0.0.2", environment)).rejects.toThrow(
			"missing firmware_metadata.json",
		);
	});

	it.each(["bootloader.bin", "firmware.bin"])(
		"rejects a missing %s",
		async (missing) => {
			const data = await archive("", "0x1000", missing);
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => data }),
			);
			await expect(loadFirmwareFiles("1.2.3", environment)).rejects.toThrow(
				`missing ${missing}`,
			);
		},
	);

	it("rejects invalid flash offsets", async () => {
		const data = await archive("", "0x1000junk");
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => data }),
		);
		await expect(loadFirmwareFiles("1.2.3", environment)).rejects.toThrow(
			"invalid offset",
		);
	});

	it("reports release API and download errors", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 403 }),
		);
		await expect(fetchFirmwareReleases()).rejects.toThrow("HTTP 403");
		await expect(loadFirmwareFiles("1.2.3", environment)).rejects.toThrow(
			"HTTP 403",
		);
	});
});

describe("firmware download proxy", () => {
	it("streams the exact tagged board archive and follows GitHub redirects", async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response("zip bytes"));
		vi.stubGlobal("fetch", fetchMock);
		const response = await handler(
			new Request(
				`https://install.example/.netlify/functions/firmware?version=v1.2.3&environment=${environment}`,
			),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			`https://github.com/ttnleipzig/regenfass/releases/download/v1.2.3/regenfass-v1.2.3-${environment}.zip`,
			{ redirect: "follow" },
		);
		expect(response.headers.get("Content-Type")).toBe("application/zip");
		expect(await response.text()).toBe("zip bytes");
	});

	it.each(firmwareEnvironments)(
		"downloads the selected %s archive without a board fallback",
		async (selected) => {
			const fetchMock = vi.fn().mockResolvedValue(new Response("zip bytes"));
			vi.stubGlobal("fetch", fetchMock);
			const response = await handler(
				new Request(
					`https://install.example/?version=1.2.3&environment=${selected}`,
				),
			);
			expect(response.status).toBe(200);
			expect(fetchMock).toHaveBeenCalledWith(
				`https://github.com/ttnleipzig/regenfass/releases/download/1.2.3/regenfass-1.2.3-${selected}.zip`,
				{ redirect: "follow" },
			);
		},
	);

	it.each(["", "../other", "board/other"])(
		"rejects missing or unsafe environment %j",
		async (selected) => {
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);
			expect(
				(
					await handler(
						new Request(
							`https://install.example/?version=1.2.3&environment=${encodeURIComponent(selected)}`,
						),
					)
				).status,
			).toBe(400);
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it("rejects invalid tags without fetching", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		expect(
			(await handler(new Request("https://install.example/?version=../other")))
				.status,
		).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns upstream errors and network failures", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
		);
		const request = new Request(
			`https://install.example/?version=1.2.3&environment=${environment}`,
		);
		expect((await handler(request)).status).toBe(404);
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		expect((await handler(request)).status).toBe(502);
	});
});

describe("PlatformIO board and sensor selection", () => {
	it("includes all seven configured environments", () => {
		expect(firmwareEnvironments).toHaveLength(7);
		expect(firmwareEnvironments).toContain("IoT-PostBox_v1_VL53L1X");
		expect(firmwareEnvironments).toContain("az-delivery-devkit-v4_VL53L1X");
	});
	it("offers only releases containing the selected environment", () => {
		const releases = [
			{
				version: "1.2.3",
				environments: [environment, "az-delivery-devkit-v4_HCSR04"],
			},
			{ version: "1.2.2", environments: [environment] },
		];
		expect(
			versionsForEnvironment(releases, "az-delivery-devkit-v4_HCSR04"),
		).toEqual(["1.2.3"]);
		expect(versionsForEnvironment(releases, "IoT-PostBox_v1_VL53L1X")).toEqual(
			[],
		);
		expect(versionsForEnvironment(releases, null)).toEqual([]);
	});
	it.each(firmwareEnvironments)(
		"loads files for the selected %s",
		async (selected) => {
			const data = await archive();
			const fetchMock = vi
				.fn()
				.mockResolvedValue({ ok: true, arrayBuffer: async () => data });
			vi.stubGlobal("fetch", fetchMock);
			expect(await loadFirmwareFiles("1.2.3", selected)).toHaveLength(4);
			expect(fetchMock).toHaveBeenCalledWith(`/firmware/1.2.3/${selected}`);
		},
	);
});
