import { ConfigField } from "@/installer/types.ts";
import { Config, CONFIG_VERSIONS, DeviceInfo } from "@/libs/install/config.ts";
import { readField, SCPAdapter } from "@/libs/install/sdp.ts";
import EncLatin1 from "crypto-js/enc-latin1.js";
import MD5 from "crypto-js/md5.js";
import { ESPLoader, LoaderOptions, Transport } from "esptool-js";
import JSZip from "jszip";
import { assign, emit, fromPromise, setup } from "xstate";
import { LineType } from "../scp/scp.mjs";

const url =
	"https://s3.devminer.xyz/archive/firmware-heltec_wifi_lora_32_V3_HCSR04.zip";
const REGENFASS_BTLE_SVC_CLASS_ID = "6f48ffcd-ee40-41c3-a6c1-5c2f022ef528";

const sleep = (ms: number) =>
	new Promise<void>((res) => setTimeout(() => res(), ms));

// hardReset() taken from https://github.com/esphome/esp-web-tools/blob/df4ae5b0b088a27f8931d2a953ab0882e3263c86/src/util/reset.ts
const hardReset = async (transport: Transport) => {
	console.log("Triggering reset");
	await transport.device.setSignals({
		dataTerminalReady: false,
		requestToSend: true,
	});
	await sleep(250);
	await transport.device.setSignals({
		dataTerminalReady: false,
		requestToSend: false,
	});
	await sleep(250);
	await new Promise((resolve) => setTimeout(resolve, 1000));
};

const loadDeviceInfo = async (connection: SCPAdapter): Promise<DeviceInfo> => {
	const firmwareVersion = await readField(connection, "version");
	console.log("Firmware version:", firmwareVersion);
	const configVersion = +(await readField(connection, "configVersion"));
	console.log("Config version:", configVersion);

	const applicableConfig = CONFIG_VERSIONS.find(
		(v) => v.version === configVersion
	);
	if (!applicableConfig) {
		throw new Error(
			`Unknown config version: ${configVersion}, there is no loader implemented`
		);
	}

	const config = await applicableConfig.load((field) =>
		readField(connection, field)
	);

	const info: DeviceInfo = {
		configVersion,
		firmwareVersion,
		config,
	};

	console.log("Loaded config from device", info);

	return info;
};

const writeConfiguration = async (
	connection: SCPAdapter,
	config: Config
): Promise<Config> => {
	for (const [key, value] of Object.entries(config)) {
		connection.write({ type: LineType.SET, key, value: value.toString() });
	}

	return config;
};

const migrateConfiguration = async (
	connection: SCPAdapter,
	desiredVersion: number
): Promise<DeviceInfo> => {
	let info = await loadDeviceInfo(connection);

	while (info.configVersion < desiredVersion) {
		const nextVersion = info.configVersion + 1;

		let nextConfigVersion = CONFIG_VERSIONS.find(
			(v) => v.version === nextVersion
		);
		if (!nextConfigVersion) {
			throw new Error(
				`Failed to migrate from ${info.configVersion} to ${nextVersion} (to get to ${desiredVersion}), could not find handler for config format for v${nextVersion}`
			);
		}

		info.config = nextConfigVersion.upgrade(info.config) as Config;
		info.configVersion = nextConfigVersion.version;
	}

	return info;
};

export const setupStateMachine = setup({
	types: {
		context: {} as {
			upstreamVersions: string[];
			// Maybe we should do this as a normal error?
			error: unknown | null;
			connection: readonly [SerialPort, SCPAdapter] | null;
			firmwareVersion: string | null;
			targetFirmwareVersion: string | null;
			deviceInfo: DeviceInfo;
		},
		events: {} as
			| { type: "start.next" }
			| { type: "install.install" }
			| { type: "install.configure" }
			| { type: "install.target_version_selected"; version: string | null }
			| {
					type: "config.changeField";
					field: ConfigField;
					value: string;
			  }
			| { type: "config.clear" }
			| { type: "config.loadFromFile"; config: Config }
			| { type: "config.saveToFile" }
			| { type: "config.write" }
			| { type: "config.next" }
			| { type: "restart" },
		emitted: {} as
			| { type: "config.saveToFile"; configVersion: number; config: Config }
			| {
					type: "install.progress";
					/** Between 0 and 1 */
					progress: number;
			  },
	},
	actors: {
		checkIfWebSerialIsSupported: fromPromise(
			async () => navigator.serial !== undefined
		),
		fetchUpstreamVersions: fromPromise(() => {
			// TODO: Download versions from GitHub releases
			return Promise.resolve(["0.0.1"]);
		}),
		requestConnection: fromPromise(async () => {
			const port = await navigator.serial.requestPort({
				// allowedBluetoothServiceClassIds: [REGENFASS_BTLE_SVC_CLASS_ID],
			});

			console.log("opening!");
			await port.open({ baudRate: 115200 });

			return [port, SCPAdapter.forSerialPort(port)] as const;
		}),
		installFirmware: fromPromise<
			[string, SCPAdapter],
			{ connection: SerialPort; version: string }
		>(async ({ input: { connection: port, version } }) => {
			const z = new JSZip();

			const res = await fetch(url);
			const zipBuf = res.arrayBuffer();
			const zip = await z.loadAsync(zipBuf);

			const firmwareMetadata: {
				flash_images: {
					offset: string;
					path: string;
				}[];
				application_offset: string;
			} = JSON.parse(await zip.file("firmware_metadata.json")!.async("text"));

			await port.close();
			console.log("CLOSED PORT BEFORE FLASHING");

			const transport = new Transport(port, true);

			const espLoaderTerminal = {
				clean() {
					console.clear();
				},
				writeLine(data: unknown) {
					console.log(data);
				},
				write(data: unknown) {
					console.log(data);
				},
			};

			const loaderOpts: LoaderOptions = {
				transport,
				baudrate: 115200,
				romBaudrate: 115200,
				terminal: espLoaderTerminal,
				debugLogging: true,
				// romBaudrate:
			};
			const esploader = new ESPLoader(loaderOpts);

			try {
				const chip = await esploader.main();
				console.log(chip);

				const bootloaderBin = await zip
					.file("bootloader.bin")!
					.async("binarystring");
				const partitionsBin = await zip
					.file("partitions.bin")!
					.async("binarystring");
				const bootApp0Bin = await zip
					.file("boot_app0.bin")!
					.async("binarystring");
				const firmwareBin = await zip
					.file("firmware.bin")!
					.async("binarystring");

				await esploader.writeFlash({
					fileArray: [
						{
							data: bootloaderBin,
							address: parseInt(
								firmwareMetadata.flash_images.find((i) =>
									i.path.endsWith("/bootloader.bin")
								)!.offset,
								16
							),
						},
						{
							data: partitionsBin,
							address: parseInt(
								firmwareMetadata.flash_images.find((i) =>
									i.path.endsWith("/partitions.bin")
								)!.offset,
								16
							),
						},
						{
							data: bootApp0Bin,
							address: parseInt(
								firmwareMetadata.flash_images.find((i) =>
									i.path.endsWith("/boot_app0.bin")
								)!.offset,
								16
							),
						},
						{
							data: firmwareBin,
							address: parseInt(firmwareMetadata.application_offset, 16),
						},
					],
					eraseAll: false,
					compress: true,
					reportProgress: (fileIndex, written, total) => {
						console.log(`file ${fileIndex}: ${written}/${total} bytes`);
					},
					calculateMD5Hash: (image) => MD5(EncLatin1.parse(image)).toString(),
					flashMode: "keep",
					flashFreq: "keep",
					flashSize: "keep",
				});
				await esploader.after();
			} catch (error) {
				console.error("installing failed:", error);
				throw error;
			} finally {
				await hardReset(transport);
				await transport.disconnect();
				console.log("DISCONNECTED TRANSPORT AFTER FLASHING");
			}

			await sleep(1000);
			await port.open({ baudRate: 115200 });
			console.log("REOPENED PORT AFTER FLASHING");

			console.log(firmwareMetadata);

			await sleep(1000);
			return [version, SCPAdapter.forSerialPort(port)] as const;
		}),
		loadDeviceInfo: fromPromise<DeviceInfo, { connection: SCPAdapter }>(
			({ input: { connection } }) => loadDeviceInfo(connection)
		),
		migrateConfiguration: fromPromise<
			DeviceInfo,
			{ connection: SCPAdapter; desiredVersion: number }
		>(({ input: { connection, desiredVersion } }) =>
			migrateConfiguration(connection, desiredVersion)
		),
		writeConfiguration: fromPromise<
			Config,
			{
				connection: SCPAdapter;
				configuration: Config;
			}
		>(({ input: { connection, configuration } }) =>
			writeConfiguration(connection, configuration)
		),
	},
	guards: {
		webSerialSupported: () => navigator.serial !== undefined,
		webSerialNotSupported: () => navigator.serial === undefined,
		targetFirmwareVersionSet: (ctx) =>
			ctx.context.targetFirmwareVersion !== null,
	},
}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5SzAFwK4AcB0BlVAhgE6oD6AwgBZgDGA1gJYB2UA6mAEa5hEMEA2uLJgD2JAMQQRTMNmYA3EXVkoMOfMTJVajFuy48+g4WNQIFImgVQNpAbQAMAXUdPEoUbAY3p7kAA9EABYARgAmbFCwgGYwhzCggE4ggA4ANmi0gBoQAE9gmOwAVgB2DISHVKK0sqCAXzqc1Sw8QhIKanpmNk5uXgEhTFEJKRk5JkVlbGb1Nq1O3R6DfuMh03MJy2tbJlc7ELckEE9vHb9AhCjI8Nj4pNSM7LzEIursaMS09JKghxDSooNJpoFoadoAMTQNEoAFVMLBUEQwAQALYANR4XmksEk0lkFimM1amlIkNQ0LhCKRqIxRCxTFgG0UVh8u2crj8J1Z50Q4Qc0WKIS+JX5SQcRWi0Ry+QQYSKiWwiQ+KTiiUSMXFkqBICJYLIZIp8MRyPRmJ2OJ4RDE2Ew-GsADMxCjpiDZiSDbCjdTTXTzUytqy9s5OSIvNyjhc+QKikKUiLomKJVLnpd-tgwmkgmlPkVQiUQkFC9rdXNSKwCKcWOCxDCUERxAjNNgaNIbEx0GAOUcuWcI7y0pniokSqUUmqvrnkzKwikHIqsyUR0FJSEHA4UsXXdhyNIZDQtLvaG2oLixgSVFud0w9wfr0fuv6WTsg4cPKHTr4+7KHIvsIuEkUKQhJK-LJNKvIqtg6RASkHxpGEwFhIkm5qNuh77hQ6HHuIlrWraDpOi6qFXjemF3vuD4WE+9jssG3bvuGoAXHEv7-kEgHAdEoFBOBso-NgiFFHKXwhCkErIdqTAiBAcB+DMIZhr2TGIAAtE8MoqUUipqmqs7JAuQkScCqF6h0OjdPofRGIMwyoApH5MDyCBqgJM7qkqcYxrBU4vB8f4cfE6o-CKRk6lupkepSxo0ma2L2YxASIOqKTFCUiRASKA4riUvHKtg8HyrcNRpKuCYoaCpblpWUDVkQtY8PFSmJQgBavOmQQIaqIQlHEma8TOc4qiqiTxOk1QldE5U4CRR5kTe3SNZ+yktcN2B-EBRTikhGaAf1pSRB5i4lLBQl-JNjRhcRWGkAASsiEDdLS9KLY5X4agK0QFp8XFhL97H9fy-k1JkKTQdEZRTdgACSDKEPw-BlhWx61TDjbw9s0gALJoJQ0lUCIDA0GAL1OR1uXilB66pGEaVquKgIXUSqNwwjVXIzWmBQEQBAyVe9oMEQKIY69b6KUtzVvKD3VVFLKrLrx8aRH8PzdelPXDpDzMCAjWvwwt9FiyLzUFiE+UFrTP5pEm6W8aJaTvNEKqLsBw6OyUmuw9rpBwhA2wsCTX4m-lgFxLEZTqnERS5YOSGlHbIoIT1HtowjmMMFzftQHz6foNzCU9uLFwjWtpQlLEs6g79ju8ZmQSKq14rJXmG6M5e0j81ApAADIiDz3TZ1AufCwHy1Ku8m2JN1VdBGlWa8R1ETHbH7G-EJ6T1K3V1MB3pAAKIPceI-G1miqzgZ0SvPEI7z0B6YimvZcfGqI6QwPZa8MeA9D-nDFNUX9shG6mJWIXwszLh4imcIJQoKbQTskeCNRSiQ3BMwBgsBKCkFwLjAA7t0AAcmAfwqB8BgHhEfC4cYoJu0AhkY6rwhT9ULFBOUMYuKrnFH8DexkWgoKYGgjBWCRC4JYLvIgVoiDkMQO9d4X0MjxD+lHFM4DFSahVJtAcM9zoNCAA */
	id: "setup",
	initial: "Start_CheckingWebSerialSupport",
	context: {
		upstreamVersions: [],
		error: null,
		connection: null,
		deviceInfo: null as unknown as DeviceInfo,
		firmwareVersion: null,
		targetFirmwareVersion: null,
	},
	exit: ({ context }) => {
		context.connection?.[1].stop();
		context.connection?.[0].close();
	},
	states: {
		Start_CheckingWebSerialSupport: {
			invoke: {
				src: "checkIfWebSerialIsSupported",
				onDone: [
					{
						target: "Start_FetchUpstreamVersions",
						guard: "webSerialSupported",
					},
					{
						target: "Finish_ShowingError",
						guard: "webSerialNotSupported",
						actions: assign({
							error: () => "Unsupported browser",
						}),
					},
				],
			},
		},
		Start_FetchUpstreamVersions: {
			guard: "webSerialSupported",
			invoke: {
				src: "fetchUpstreamVersions",
				onDone: {
					target: "Start_WaitingForUser",
					actions: assign({
						upstreamVersions: ({ event: { output } }) => output,
					}),
				},
				onError: {
					target: "Finish_ShowingError",
					actions: assign({
						error: ({ event: { error } }) => error,
					}),
				},
			},
		},

		Start_WaitingForUser: {
			on: {
				"start.next": {
					target: "Connect_Connecting",
				},
			},
		},

		Connect_Connecting: {
			invoke: {
				src: "requestConnection",
				onDone: {
					target: "Connect_ReadingVersion",
					actions: assign({
						connection: ({ event: { output } }) => output,
					}),
				},
				onError: {
					target: "Finish_ShowingError",
					actions: assign({
						error: ({ event: { error } }) => error,
					}),
				},
			},
		},
		Connect_ReadingVersion: {
			invoke: {
				src: "loadDeviceInfo",
				input: ({ context: { connection } }) => ({
					connection: connection![1],
				}),
				onDone: {
					target: "Install_WaitingForInstallationMethodChoice",
					actions: assign({
						firmwareVersion: ({ event: { output } }) => output.firmwareVersion,
						deviceInfo: ({ event: { output } }) => output,
					}),
				},
				onError: {
					target: "Finish_ShowingError",
					actions: assign({
						error: ({ event: { error } }) => error,
					}),
				},
			},
		},

		Install_WaitingForInstallationMethodChoice: {
			on: {
				"install.configure": {
					target: "Install_MigratingConfiguration",
				},
				"install.install": {
					guard: "targetFirmwareVersionSet",
					target: "Install_Installing",
				},
				"install.target_version_selected": {
					actions: assign({
						targetFirmwareVersion: (ctx) => ctx.event.version,
					}),
				},
			},
		},

		Install_Installing: {
			invoke: {
				src: "installFirmware",
				input: ({ context: { connection, targetFirmwareVersion } }) => ({
					connection: connection![0],
					version: targetFirmwareVersion!,
				}),
				onDone: {
					target: "Install_MigratingConfiguration",
					actions: assign({
						firmwareVersion: ({ event: { output } }) => output[0],
						connection: ({ context: { connection }, event: { output } }) =>
							[connection![0], output[1]] as const,
					}),
				},
				onError: {
					target: "Finish_ShowingError",
					actions: assign({
						error: ({ event: { error } }) => error,
					}),
				},
			},
		},

		Install_MigratingConfiguration: {
			invoke: {
				src: "migrateConfiguration",
				input: ({ context: { connection, deviceInfo } }) => ({
					connection: connection![1],
					desiredVersion: deviceInfo!.configVersion,
				}),
				onDone: {
					target: "Config_Editing",
					actions: assign({
						deviceInfo: ({ context: { deviceInfo }, event: { output } }) =>
							output,
					}),
				},
				onError: {
					target: "Finish_ShowingError",
					actions: assign({
						error: ({ event: { error } }) => error,
					}),
				},
			},
		},

		Config_Editing: {
			on: {
				"config.changeField": {
					actions: assign(({ event, context: { deviceInfo } }) => ({
						deviceInfo: {
							...deviceInfo,
							config: {
								...deviceInfo.config,
								[event.field]: event.value,
							},
						},
					})),
				},
				"config.clear": {
					actions: assign({
						deviceInfo: ({ context: { deviceInfo } }) => {
							const applicableConfig = CONFIG_VERSIONS.find(
								(v) => v.version === deviceInfo.configVersion
							);
							if (!applicableConfig) throw new Error("should never happen");

							return {
								...deviceInfo,
								config: applicableConfig?.getDefaultValues(),
							};
						},
					}),
				},
				"config.loadFromFile": {
					actions: assign({
						deviceInfo: ({ event: { config }, context: { deviceInfo } }) => ({
							...deviceInfo,
							config,
						}),
					}),
				},
				"config.saveToFile": {
					actions: emit(({ context: { deviceInfo } }) => ({
						type: "config.saveToFile",
						configVersion: deviceInfo.configVersion,
						config: deviceInfo.config,
					})),
				},
				"config.next": {
					target: "Finish_ShowingNextSteps",
				},
			},
		},
		Config_WritingConfiguration: {
			invoke: {
				src: "writeConfiguration",
				input: ({ context: { connection, deviceInfo } }) => ({
					configuration: deviceInfo.config,
					connection: connection![1],
				}),
				onDone: "Finish_ShowingNextSteps",
				onError: {
					target: "Finish_ShowingError",
					actions: assign({
						error: ({ event: { error } }) => error,
					}),
				},
			},
		},

		Finish_ShowingNextSteps: {
			// TODO: When we're done with the cloud, we need the onboarding to continue here
			type: "final",
		},
		Finish_ShowingError: {
			on: {
				restart: {
					target: "Start_WaitingForUser",
					actions: assign({
						error: () => null,
						connection: () => null,
						firmwareVersion: () => null,
						targetFirmwareVersion: () => null,
						deviceInfo: (ctx) => ctx.context.deviceInfo,
					}),
				},
			},
		},
	},
});
