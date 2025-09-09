import { EventEmitter } from "tiny-node-eventemitter";
import { assign, emit, fromPromise, setup } from "xstate";
import initSCP, { Line, LineType, type Line as SCPLine } from "../scp/scp.mjs";

const scp = await initSCP();

const REGENFASS_BTLE_SVC_CLASS_ID = "6f48ffcd-ee40-41c3-a6c1-5c2f022ef528";

const ConfigField = {
	firmwareVersion: "firmwareVersion",
	configVersion: "configVersion",

	appEUI: "appEUI",
	appKey: "appKey",
	devEUI: "devEUI",
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

class SCPAdapter extends EventEmitter<SCPReaderEvents> {
	// technically wrong type, it's only a `number`
	#timeout: NodeJS.Timeout | null = null;
	#buffer = "";
	#readStream: ReadableStream<Uint8Array<ArrayBufferLike>>;
	#writeStream: WritableStream<Uint8Array<ArrayBufferLike>>;
	#reader?: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>;
	#writer?: WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>;

	constructor(
		readStream: ReadableStream<Uint8Array<ArrayBufferLike>>,
		writeStream: WritableStream<Uint8Array<ArrayBufferLike>>
	) {
		super();
		this.#readStream = readStream;
		this.#writeStream = writeStream;
	}

	static forSerialPort(port: SerialPort) {
		if (!port.readable)
			throw new Error(
				`Could not create SCPReader, serial port is not readable; did you forget to open() it?`
			);

		if (!port.writable)
			throw new Error(
				`Could not create SCPReader, serial port is not writable; did you forget to open() it?`
			);

		return new SCPAdapter(port.readable, port.writable);
	}

	start() {
		this.stop();

		this.#reader = this.#readStream.getReader();
		this.#writer = this.#writeStream.getWriter();

		this.#timeout = setTimeout(() => this.#pump());

		console.log("started adapter!");
	}

	stop() {
		console.log("stopping adapter...");

		if (this.#timeout) clearTimeout(this.#timeout);

		console.log("releasing read lock");
		this.#reader?.releaseLock();
		this.#reader = undefined;

		console.log("releasing writer lock");
		this.#writer?.releaseLock();
		this.#writer = undefined;
	}

	async #pump() {
		if (!this.#reader) {
			throw new Error(
				`Could not pump, #reader is undefined; did you start the reader?`
			);
		}

		try {
			const { done, value } = await this.#reader.read();
			if (done) {
				this.emit("done");
				this.#timeout = null;
				return;
			}

			const raw = textDecoder.decode(value!);
			this.#buffer += raw;
			const lines = this.#buffer.split("\n");
			this.#buffer = lines.pop()!;

			for (const raw of lines) {
				try {
					const parsed = scp.parseLine(raw);
					console.log(`[SCPAdapter] read:`, parsed);
					this.emit("line", parsed);
				} catch (err) {
					console.error(`could not parse SCP line: ${raw}`, err);
				}
			}
		} catch (err) {
			console.error(err);
		}

		this.#timeout = setTimeout(() => this.#pump());
	}

	write(line: Line) {
		const raw = scp.lineToString(line) + "\n";

		const encoded = textEncoder.encode(raw);

		console.log("[SCPAdapter] write:", raw.replaceAll("\n", "\\n"));
		this.#writer?.write(encoded);
	}
}

const readField = async (
	adapter: SCPAdapter,
	field: string
): Promise<string> => {
	adapter.start();

	const promise = new Promise<string>((resolve, reject) => {
		let value: string | null = null;

		adapter.on("line", (line) => {
			console.log("got line");
			if (line.type === LineType.SET && line.key === field) {
				value = line.value;
				adapter.stop();
				resolve(value.trim());
			}
		});

		adapter.on("done", () => {
			if (value === null) {
				reject(new Error(`Failed to read field ${field}`));
			}
		});

		// Set a timeout
		setTimeout(() => {
			adapter.stop();
			reject(new Error(`Timeout waiting for field ${field}`));
		}, 5000);
	});

	adapter.write({ type: LineType.GET, key: field });

	return promise;
};

const loadConfiguration = async (connection: SCPAdapter): Promise<Config> => {
	const version = await readField(connection, "version");

	return {
		configVersion: "0",
		firmwareVersion: "0.0.0",
		appEUI: "",
		appKey: "",
		devEUI: "",
	};
};

const writeConfiguration = async (
	connection: SCPAdapter,
	config: Config
): Promise<Config> => {
	for (const [key, value] of Object.entries(config)) {
		connection.write({ type: LineType.SET, key, value });
	}

	return config;
};

const migrateConfiguration = async (
	connection: SCPAdapter,
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
			connection: readonly [SerialPort, SCPAdapter] | null;
			firmwareVersion: string | null;
			targetFirmwareVersion: string | null;
			configuration: Config;
		},
		events: {} as
			| { type: "start.next" }
			| { type: "install.install" }
			| { type: "install.update" }
			| { type: "install.target_version_selected"; version: string|null }
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
				// allowedBluetoothServiceClassIds: [REGENFASS_BTLE_SVC_CLASS_ID],
			});

			console.log("opening!");
			await port.open({ baudRate: 115200 });

			return [port, SCPAdapter.forSerialPort(port)] as const;
		}),
		readVersion: fromPromise<string, { connection: SCPAdapter }>(
			({ input: { connection } }) => readField(connection, "version")
		),
		installFirmware: fromPromise<
			string,
			{ connection: SCPAdapter; version: string }
		>(async ({ input: { connection, version } }) => {
			// TODO: Flash firmware
			return version;
		}),
		loadConfiguration: fromPromise<Config, { connection: SCPAdapter }>(
			({ input: { connection } }) => loadConfiguration(connection)
		),
		migrateConfiguration: fromPromise<
			Config,
			{ connection: SCPAdapter; desiredVersion: string }
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
		configuration: null as unknown as Config,
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
				src: "readVersion",
				input: ({ context: { connection } }) => ({
					connection: connection![1],
				}),
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
				"install.update": {
					guard: "targetFirmwareVersionSet",
					target: "Update_LoadingConfiguration",
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
				input: ({ context: { connection } }) => ({
					connection: connection![1],
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

		Update_LoadingConfiguration: {
			invoke: {
				src: "loadConfiguration",
				input: ({ context: { connection, firmwareVersion } }) => ({
					connection: connection![1],
					// TODO: Map firmware version to desired version
					desiredVersion: firmwareVersion!,
				}),
				onDone: {
					target: "Finish_ShowingError",
					actions: assign({
						error: "loaded",
						configuration: ({ event }) => event.output,
					}),
				},
			},
		},

		Install_Updating: {
			invoke: {
				src: "installFirmware",
				input: ({ context: { connection } }) => ({
					connection: connection![1],
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
					connection: connection![1],
					// TODO: Map firmware version to desired version
					desiredVersion: firmwareVersion!,
				}),
			},
		},

		Config_LoadingConfiguration: {
			invoke: {
				src: "loadConfiguration",
				input: ({ context: { connection } }) => ({
					connection: connection![1],
				}),
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
		Finish_ShowingError: { type: "final" },
	},
});
