import JSZip from "jszip";

/** PlatformIO environments injected by Vite from firmware/platformio.ini. */
export const firmwareEnvironments: readonly string[] =
	__FIRMWARE_ENVIRONMENTS__;

export interface FirmwareRelease {
	version: string;
	environments: string[];
}

/** Returns only versions that publish an archive for the selected environment. */
export function versionsForEnvironment(
	releases: FirmwareRelease[],
	environment: string | null,
): string[] {
	return releases
		.filter(
			(release) =>
				environment !== null && release.environments.includes(environment),
		)
		.map((release) => release.version);
}
const releasesUrl =
	"https://api.github.com/repos/ttnleipzig/regenfass/releases";

interface Release {
	tag_name: string;
	draft: boolean;
	prerelease: boolean;
	assets: { name: string }[];
}

interface FirmwareMetadata {
	flash_images: { path: string; offset: string }[];
	application_offset: string;
}

/** Lists stable releases and their published PlatformIO environment archives. */
export async function fetchFirmwareReleases(): Promise<FirmwareRelease[]> {
	const response = await fetch(`${releasesUrl}?per_page=100`);
	if (!response.ok)
		throw new Error(
			`Could not load firmware releases (HTTP ${response.status}).`,
		);
	const releases: Release[] = await response.json();
	return releases
		.filter((release) => !release.draft && !release.prerelease)
		.map((release) => ({
			version: release.tag_name,
			environments: firmwareEnvironments.filter((environment) =>
				release.assets.some(
					(asset) =>
						asset.name === `regenfass-${release.tag_name}-${environment}.zip`,
				),
			),
		}))
		.filter((release) => release.environments.length > 0);
}

/** Downloads and validates a release archive before the serial port is closed. */
export async function loadFirmwareFiles(version: string, environment: string) {
	if (!firmwareEnvironments.includes(environment))
		throw new Error("Unknown firmware environment.");
	const response = await fetch(
		`/firmware/${encodeURIComponent(version)}/${encodeURIComponent(environment)}`,
	);
	if (!response.ok) {
		throw new Error(
			`Could not download firmware ${version} (HTTP ${response.status}).`,
		);
	}
	const zip = await JSZip.loadAsync(await response.arrayBuffer());
	const metadataFile = zip.file("firmware_metadata.json");
	if (!metadataFile) {
		throw new Error(
			"This firmware release is missing firmware_metadata.json. Please select a newer release.",
		);
	}
	const metadata: FirmwareMetadata = JSON.parse(
		await metadataFile.async("text"),
	);
	if (
		!Array.isArray(metadata.flash_images) ||
		metadata.flash_images.length === 0
	) {
		throw new Error("The firmware release has invalid flash metadata.");
	}
	return Promise.all(
		[
			...metadata.flash_images,
			{ path: "firmware.bin", offset: metadata.application_offset },
		].map(async (image) => {
			const name = image.path.split(/[\\/]/).pop()!;
			const file = zip.file(name);
			if (!file) throw new Error(`The firmware release is missing ${name}.`);
			if (
				typeof image.offset !== "string" ||
				!/^(?:0x)?[0-9a-f]+$/i.test(image.offset)
			) {
				throw new Error(
					`The firmware release has an invalid offset for ${name}.`,
				);
			}
			const address = parseInt(image.offset, 16);
			if (!Number.isSafeInteger(address)) {
				throw new Error(
					`The firmware release has an invalid offset for ${name}.`,
				);
			}
			return { data: await file.async("binarystring"), address };
		}),
	);
}
