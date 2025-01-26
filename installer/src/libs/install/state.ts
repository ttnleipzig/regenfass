import { EventEmitter } from "tiny-node-eventemitter";
import { assign, emit, fromPromise, setup } from "xstate";
import initSCP, { type Line as SCPLine } from "../scp/scp.mjs";

const scp = await initSCP();

const REGENFASS_BTLE_SVC_CLASS_ID = "6f48ffcd-ee40-41c3-a6c1-5c2f022ef528";

const ConfigField = {
	firmwareVersion: "firmwareVersion",
	configVersion: "configVersion",

	appEUI: "appEUI",
	appKey: "appKey",
	devEUI: "devUEI",
} as const;
type ConfigField = keyof typeof ConfigField;

type Upgrader<Fields extends ConfigField[]> = (
	config: Record<string, string>
) => Record<Fields[number], string>;
type Downgrader<Fields extends ConfigField[]> = (
	config: Record<Fields[number], string>
) => Record<string, string>;

type ConfigV<Version extends number, Fields extends ConfigField[]> = {
	version: Version;
	fields: Fields;
	upgrade: Upgrader<Fields>;
	downgrade: Downgrader<Fields>;
	$schema: Record<Fields[number], string>;
};

const makeConfig = <Version extends number, Fields extends ConfigField[]>(
	version: Version,
	fields: Fields,
	upgrade: Upgrader<Fields>,
	downgrade: Downgrader<Fields>
) => ({ version, fields, upgrade, downgrade } as ConfigV<Version, Fields>);

const configV1 = makeConfig(
	1,
	["firmwareVersion", "configVersion", "appEUI", "appKey", "devEUI"],
	(config) => config,
	(config) => config
);
type ConfigV1 = typeof configV1.$schema;

type Config = ConfigV1;
const configVersions = [configV1];

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type SCPReaderEvents = {
	done(): void;
	line(line: SCPLine): void;
};

class SCPReader extends EventEmitter<SCPReaderEvents> {
	#timeout: NodeJS.Timeout | null = null;
	#buffer = "";
	stream: ReadableStream<Uint8Array<ArrayBufferLike>>;
	#reader?: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>;

	constructor(stream: ReadableStream<Uint8Array<ArrayBufferLike>>) {
		super();
		this.stream = stream;
	}

	static forSerialPort(port: SerialPort) {
		if (!port.readable)
			throw new Error(
				`Could not create SCPReader, serial port is not readable; did you forget to open() it?`
			);

		return new SCPReader(port.readable);
	}

	start() {
		this.stop();
		this.#reader = this.stream.getReader();
		this.#timeout = setTimeout(() => this.#pump());
	}

	stop() {
		if (this.#timeout) clearTimeout(this.#timeout);
		this.#reader?.releaseLock();
	}

	async #pump() {
		if (!this.#reader) {
			throw new Error(
				`Could not pump, #reader is undefined; did you start the reader`
			);
		}

		const { done, value } = await this.#reader.read();
		if (done) {
			this.emit("done");
			this.#timeout = null;
			return;
		}

		this.#buffer += textDecoder.decode(value!);
		const lines = this.#buffer.split("\n");
		this.#buffer = lines[lines.length - 1];

		for (const raw of lines) {
			try {
				const parsed = scp.parseLine(raw);
				this.emit("line", parsed);
			} catch (err) {
				console.error(`could not parse SCP line: ${raw}`, err);
			}
		}

		this.#timeout = setTimeout(() => this.#pump());
	}
}

const readField = async (
	connection: SerialPort,
	field: string
): Promise<string> => {
	if (!connection.readable) throw new Error(`Connection not readable`);
	if (!connection.writable) throw new Error(`Connection not writable`);

	const writer = connection.writable.getWriter();
	await writer.write(textEncoder.encode(`${field}?`));
	writer.releaseLock();

	const reader = connection.readable.getReader();
	const result = await reader.read();
	reader.releaseLock();
	if (!result.value) throw new Error(`Did not receive response back`);

	return textDecoder.decode(result.value);
};

const loadConfiguration = async (connection: SerialPort): Promise<Config> => {
	const version = await readField(connection, "version");
	console.log(version);

	return {
		configVersion: "0",
		firmwareVersion: "0.0.0",
		appEUI: "",
		appKey: "",
		devEUI: "",
	};
};

const writeConfiguration = async (
	connection: SerialPort,
	config: Config
): Promise<Config> => {
	if (!connection.writable) throw new Error(`Connection not writable`);

	for (const [key, value] of Object.entries(config)) {
		const writer = connection.writable.getWriter();
		await writer.write(textEncoder.encode(`${key}=${value}\n`));
		writer.releaseLock();
	}

	return config;
};

const migrateConfiguration = async (
	connection: SerialPort,
	desiredVersion: string
): Promise<Config> => {
	let config = await loadConfiguration(connection);
	if (config.configVersion === desiredVersion) return config;

	while (config.configVersion < desiredVersion) {
		const nextVersion = +config.configVersion + 1;

		let nextConfigVersion = configVersions.find(
			(v) => v.version === nextVersion
		);
		if (!nextConfigVersion) {
			throw new Error(
				`Failed to migrate from ${config.configVersion} to ${nextVersion} (to get to ${desiredVersion})`
			);
		}

		config = nextConfigVersion.upgrade(config);
	}

	return config;
};

export const setupStateMachine = setup({
	types: {
		context: {} as {
			upstreamVersions: string[];
			// Maybe we should do this as a normal error?
			error: unknown | null;
			connection: readonly [SerialPort, SCPReader] | null;
			firmwareVersion: string | null;
			configuration: Config;
		},
		events: {} as
			| { type: "start.next" }
			| { type: "install.install" }
			| { type: "install.update" }
			| {
					type: "config.changeField";
					field: ConfigField;
					value: string;
			  }
			| { type: "config.clear" }
			| { type: "config.loadFromFile"; config: Config }
			| { type: "config.saveToFile" }
			| { type: "config.write" }
			| { type: "config.next" },
		emitted: {} as
			| { type: "config.saveToFile"; config: Config }
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
				allowedBluetoothServiceClassIds: [REGENFASS_BTLE_SVC_CLASS_ID],
			});

			await port.open({ baudRate: 115200 });

			return [port, SCPReader.forSerialPort(port)] as const;
		}),
		readVersion: fromPromise<string, { connection: SerialPort }>(
			async ({ input: { connection } }) => {
				// TODO: Read configuration from device
				return "0.0.0";
			}
		),
		installFirmware: fromPromise<
			string,
			{ connection: SerialPort; version: string }
		>(async ({ input: { connection, version } }) => {
			// TODO: Flash firmware
			return version;
		}),
		loadConfiguration: fromPromise<Config, { connection: SerialPort }>(
			({ input: { connection } }) => loadConfiguration(connection)
		),
		migrateConfiguration: fromPromise<
			Config,
			{ connection: SerialPort; desiredVersion: string }
		>(({ input: { connection, desiredVersion } }) =>
			migrateConfiguration(connection, desiredVersion)
		),
		writeConfiguration: fromPromise<
			Config,
			{
				connection: SerialPort;
				configuration: Config;
			}
		>(({ input: { connection, configuration } }) =>
			writeConfiguration(connection, configuration)
		),
	},
	guards: {
		webSerialSupported: () => navigator.serial !== undefined,
		webSerialNotSupported: () => navigator.serial === undefined,
	},
}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5SzAFwK4AcB0BlVAhgE6oD6AwgBZgDGA1gJYB2UA6mAEa5hEMEA2uLJgD2JAMQQRTMNmYA3EXVkoMOfMTJVajFuy48+g4WNQIFImgVQNpAbQAMAXUdPEoUbAY3p7kAA9EABYARgAmbFCwgGYwhzCggE4ggA4ANmi0gBoQAE9gmOwAVgB2DISHVKK0sqCAXzqc1Sw8QhIKanpmNk5uXgEhTFEJKRk5JkVlbGb1Nq1O3R6DfuMh03MJy2tbJlc7ELckEE9vHb9AhCjI8Nj4pNSM7LzEIursaMS09JKghxDSooNJpoFoadoAMTQNEoAFVMLBUEQwAQALYANR4XmksEk0lkFimM1amlIkNQ0LhCKRqIxRCxTFgG0UVh8u2crj8J1Z50Q4Qc0WKIS+JX5SQcRWi0Ry+QQYSKiWwiQ+KTiiUSMXFkqBICJYLIZIp8MRyPRmJ2OJ4RDE2Ew-GsADMxCjpiDZiSDbCjdTTXTzUytqy9s5OSIvNyjhc+QKikKUiLomKJVLnpd-tgwmkgmlPkVQiUQkFC9rdXNSKwCKcWOCxDCUERxAjNNgaNIbEx0GAOUcuWcI7y0pniokSqUUmqvrnkzKwikHIqsyUR0FJSEHA4UsXXdhyNIZDQtLvaG2oLixgSVFud0w9wfr0fuv6WTsg4cPKHTr4+7KHIvsIuEkUKQhJK-LJNKvIqtg6RASkHxpGEwFhIkm5qNuh77hQ6HHuIlrWraDpOi6qFXjemF3vuD4WE+9jssG3bvuGoAXHEv7-kEgHAdEoFBOBso-NgiFFHKXwhCkErIdqTAiBAcB+DMIZhr2TGIAAtE8MoqUUipqmqs7JAuQkScCqF6h0OjdPofRGIMwyoApH5MDyCBqgJM7qkqcYxrBU4vB8f4cfE6o-CKRk6lupkepSxo0ma2L2YxASIOqKTFCUiRASKA4riUvHKtg8HyrcNRpKuCYoaCpblpWUDVkQtY8PFSmJQgBavOmQQIaqIQlHEma8TOc4qiqiTxOk1QldE5U4CRR5kTe3SNZ+yktcN2B-EBRTikhGaAf1pSRB5i4lLBQl-JNjRhcRWGkAASsiEDdLS9KLY5X4agK0QFp8XFhL97H9fy-k1JkKTQdEZRTdgACSDKEPw-BlhWx61TDjbw9s0gALJoJQ0lUCIDA0GAL1OR1uXilB66pGEaVquKgIXUSqNwwjVXIzWmBQEQBAyVe9oMEQKIY69b6KUtzVvKD3VVFLKrLrx8aRH8PzdelPXDpDzMCAjWvwwt9FiyLzUFiE+UFrTP5pEm6W8aJaTvNEKqLsBw6OyUmuw9rpBwhA2wsCTX4m-lgFxLEZTqnERS5YOSGlHbIoIT1HtowjmMMFzftQHz6foNzCU9uLFwjWtpQlLEs6g79ju8ZmQSKq14rJXmG6M5e0j81ApAADIiDz3TZ1AufCwHy1Ku8m2JN1VdBGlWa8R1ETHbH7G-EJ6T1K3V1MB3pAAKIPceI-G1miqzgZ0SvPEI7z0B6YimvZcfGqI6QwPZa8MeA9D-nDFNUX9shG6mJWIXwszLh4imcIJQoKbQTskeCNRSiQ3BMwBgsBKCkFwLjAA7t0AAcmAfwqB8BgHhEfC4cYoJu0AhkY6rwhT9ULFBOUMYuKrnFH8DexkWgoKYGgjBWCRC4JYLvIgVoiDkMQO9d4X0MjxD+lHFM4DFSahVJtAcM9zoNCAA */
	id: "setup",
	initial: "Start_CheckingWebSerialSupport",
	context: {
		upstreamVersions: [],
		error: null,
		connection: null,
		configuration: null as unknown as Config,
		firmwareVersion: null,
	},
	exit: ({ context }) => {
		context.connection?.close();
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
				src: "readVersion",
				input: ({ context: { connection } }) => ({ connection: connection! }),
				onDone: {
					target: "Install_WaitingForInstallationMethodChoice",
					actions: assign({
						firmwareVersion: ({ event: { output } }) => output,
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
				"install.update": "Install_Updating",
				"install.install": "Install_Installing",
			},
		},

		Install_Installing: {
			invoke: {
				src: "installFirmware",
				input: ({ context: { connection } }) => ({
					connection: connection!,
					// TODO: Ask for firmware version
					version: "0.0.0",
				}),
				onDone: {
					target: "Config_LoadingConfiguration",
					actions: assign({
						firmwareVersion: ({ event: { output } }) => output,
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

		Install_Updating: {
			invoke: {
				src: "installFirmware",
				input: ({ context: { connection } }) => ({
					connection: connection!,
					// TODO: Ask for the firmware version
					version: "0.0.0",
				}),
				onDone: {
					target: "Install_MigratingConfiguration",
					actions: assign({
						firmwareVersion: ({ event: { output } }) => output,
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
				input: ({ context: { connection, firmwareVersion } }) => ({
					connection: connection!,
					// TODO: Map firmware version to desired version
					desiredVersion: firmwareVersion!,
				}),
			},
		},

		Config_LoadingConfiguration: {
			invoke: {
				src: "loadConfiguration",
				input: ({ context: { connection } }) => ({ connection: connection! }),
				onDone: {
					actions: assign({
						configuration: ({ event: { output } }) => output,
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
					actions: assign(({ event, context }) => ({
						configuration: {
							...context.configuration,
							[event.field]: event.value,
						},
					})),
				},
				"config.clear": {
					actions: assign({
						configuration: ({ context: { configuration } }) => ({
							firmwareVersion: configuration.firmwareVersion,
							configVersion: configuration.configVersion,
							appEUI: "",
							appKey: "",
							devEUI: "",
						}),
					}),
				},
				"config.loadFromFile": {
					actions: assign({
						configuration: ({ event: { config } }) => config,
					}),
				},
				"config.saveToFile": {
					actions: emit(({ context: { configuration: config } }) => ({
						type: "config.saveToFile",
						config,
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
				input: ({ context: { connection, configuration } }) => ({
					configuration,
					connection: connection!,
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
		Finish_ShowingError: { type: "final" },
	},
});
