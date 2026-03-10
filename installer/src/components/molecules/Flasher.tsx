import { Button } from "@/components/atoms/Button.tsx";
import { ESPLoader, FlashOptions, LoaderOptions, Transport } from "esptool-js";
import { createSignal, Show } from "solid-js";

type DeviceInfo = {
	port: SerialPort;
	espLoader: ESPLoader;
	chip: string;
};

function Flasher() {
	const [device, setDevice] = createSignal<DeviceInfo | null>(null);
	const [file, setFile] = createSignal<File | null>(null);
	const [message, setMessage] = createSignal<string | null>(null);

	return (
		<div>
			<Button
				onClick={async () => {
					try {
						const port = await navigator.serial.requestPort();
						const transport = new Transport(port, true);
						const espLoader = new ESPLoader({
							baudrate: 921600,
							debugLogging: true,
							// romBaudrate:
							transport,
						} as LoaderOptions);

						const chip = await espLoader.main();

						setDevice({ port, espLoader, chip });
						setMessage(null);
					} catch (e) {
						const name = (e as any)?.name || "";
						if (name === "NotFoundError") {
							setMessage("No port selected. Please choose a serial device to continue.");
							return;
						}
						if (import.meta.env.DEV) console.error(e);
						setMessage("Could not open serial port.");
					}
				}}
			>
				Connect
			</Button>

			<Show when={device()}>
				{(dev) => {
					return (
						<>
							<DevInfo info={dev()} />
							<input
								type="file"
								onChange={(e) =>
									setFile((e.target.files ?? [])[0] ?? null)
								}
							/>

							<Button
								onClick={async () => {
									const content = await file()?.text();
									if (!content) {
										if (import.meta.env.DEV) console.log("no content?");
										return;
									}

									try {
										const flashOptions: FlashOptions = {
											fileArray: [
												{
													address: 0x0,
													data: content,
												},
											],
											flashFreq: "921600",
											flashMode: "QIO",
											flashSize: "keep",
											eraseAll: false,
											compress: true,
											reportProgress: (
												fileIndex,
												written,
												total
											) => {
												if (import.meta.env.DEV)
													console.log({ fileIndex, written, total });
											},
										} satisfies FlashOptions;

										await dev().espLoader.writeFlash(
											flashOptions
										);
									} catch (e) {
										if (import.meta.env.DEV) console.error(e);
									}
							}}
						>
							Connect
						</Button>
					</>
				);
			}}
			</Show>

			<Show when={message()}>
				<p class="mt-3 text-sm text-muted-foreground">{message()}</p>
			</Show>
		</div>
	);
}

function DevInfo({ info }: { info: DeviceInfo }) {
	return (
		<div>
			<p>Connected to {info.chip}</p>
		</div>
	);
}

export default Flasher;
