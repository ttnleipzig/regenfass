import { ESPLoader, FlashOptions, LoaderOptions, Transport } from "esptool-js";
import { createSignal, Show } from "solid-js";
import { Button } from "./components/ui/button.tsx";

type DeviceInfo = {
	port: SerialPort;
	espLoader: ESPLoader;
	chip: string;
};

export function Flasher() {
	const [device, setDevice] = createSignal<DeviceInfo | null>(null);
	const [file, setFile] = createSignal<File | null>(null);

	return (
		<div>
			<Button
				onClick={async () => {
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
										console.log("no content?");
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
												console.log({
													fileIndex,
													written,
													total,
												});
											},
										} satisfies FlashOptions;

										await dev().espLoader.writeFlash(
											flashOptions
										);
									} catch (e) {
										console.error(e);
									}
								}}
							>
								Connect
							</Button>
						</>
					);
				}}
			</Show>
		</div>
	);
}

function DevInfo({ info }: { info: DeviceInfo }) {
	return (
		<div>
			<p>Found device:</p>
			<pre class="font-mono whitespace-pre">
				{JSON.stringify(info.port.getInfo())}
			</pre>
		</div>
	);
}
