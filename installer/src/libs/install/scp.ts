import { EventEmitter } from "tiny-node-eventemitter";
import initSCP, {
	Line,
	LineType as SDPLineType,
	type Line as SCPLine,
} from "../scp/scp.mjs";

const scp = await initSCP();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type SCPReaderEvents = {
	done(): void;
	line(line: SCPLine): void;
};

export class SCPAdapter extends EventEmitter<SCPReaderEvents> {
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

		console.debug("started adapter!");
	}

	stop() {
		console.debug("stopping adapter...");

		if (this.#timeout) clearTimeout(this.#timeout);

		console.debug("releasing read lock");
		this.#reader?.releaseLock();
		this.#reader = undefined;

		console.debug("releasing writer lock");
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
					console.debug(`[SCPAdapter] read:`, parsed);
					this.emit("line", parsed);
				} catch (err) {
					console.error(`could not parse SCP line, skipping: ${raw}`, err);
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

		console.debug("[SCPAdapter] write:", raw.replaceAll("\n", "\\n"));
		this.#writer?.write(encoded);
	}
}

export const readField = async (
	adapter: SCPAdapter,
	field: string
): Promise<string> => {
	adapter.start();

	const promise = new Promise<string>((resolve, reject) => {
		let value: string | null = null;

		adapter.on("line", (line) => {
			console.log("got line");
			if (line.type === SDPLineType.SET && line.key === field) {
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

	adapter.write({ type: SDPLineType.GET, key: field });

	return promise;
};

export const writeField = async (
	adapter: SCPAdapter,
	field: string,
	value: string
): Promise<void> => {
	adapter.start();

	const promise = new Promise<void>((resolve, reject) => {
		setTimeout(() => {
			adapter.stop();
			resolve();
		}, 1000);
	});

	adapter.write({ type: SDPLineType.SET, key: field, value });

	return promise;
};
