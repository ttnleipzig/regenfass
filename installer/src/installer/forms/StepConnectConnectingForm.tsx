import { Component, createSignal } from "solid-js";
import { FormLayout } from "@/components/forms/FormLayout";
import { Select } from "@/components/forms/Select";
import { ButtonAction } from "@/components/atoms/ButtonAction.tsx";
import { ErrorList } from "@/components/molecules/ErrorList.tsx";
import type { FormProps, DeviceType } from "../types";

export interface StepConnectConnectingFormProps extends FormProps {
	error?: string;
}

const deviceOptions: DeviceType[] = ["heltec-lora32", "generic-esp32"];

const deviceLabels: Record<DeviceType, string> = {
	"heltec-lora32": "Heltec LoRa32",
	"generic-esp32": "Generic ESP32",
};

const StepConnectConnectingForm: Component<StepConnectConnectingFormProps> = (
	props
) => {
	const [selectedDevice, setSelectedDevice] = createSignal<
		DeviceType | undefined
	>();
	const [isConnecting, setIsConnecting] = createSignal(false);
	const [errors, setErrors] = createSignal<string[]>([]);

	const handleConnect = async () => {
		if (!selectedDevice()) {
			setErrors(["Bitte wählen Sie einen Gerätetyp aus."]);
			return;
		}

		setIsConnecting(true);
		setErrors([]);

		try {
			// Der eigentliche Connect wird durch XState gehandhabt
			// Hier senden wir nur das Event
			props.send?.({
				type: "connect.deviceType",
				deviceType: selectedDevice(),
			});
		} catch (error) {
			setErrors([`Verbindungsfehler: ${error}`]);
			setIsConnecting(false);
		}
	};

	const handleRetry = () => {
		setErrors([]);
		setIsConnecting(false);
	};

	return (
		<FormLayout
			title="Gerät verbinden"
			subtitle="Wählen Sie Ihren Mikrocontroller-Typ aus und stellen Sie eine Verbindung her."
		>
			<div class="space-y-6">
				<div class="bg-blue-50 border border-blue-200 rounded-md p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg
								class="h-5 w-5 text-blue-400"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-blue-800">
								Verbindung herstellen
							</h3>
							<div class="mt-2 text-sm text-blue-700">
								<p>
									Stellen Sie sicher, dass Ihr Mikrocontroller über USB
									verbunden ist und wählen Sie den korrekten Typ aus.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-6">
					<Select<DeviceType>
						label="Gerätetyp"
						required
						options={deviceOptions}
						placeholder="Wählen Sie einen Gerätetyp..."
						value={selectedDevice()}
						onChange={setSelectedDevice}
						getLabel={(device) => deviceLabels[device]}
						error={errors().find((e) => e.includes("Gerätetyp"))}
					/>

					{selectedDevice() && (
						<div class="bg-gray-50 border border-gray-200 rounded-md p-4">
							<h4 class="text-sm font-medium text-gray-900 mb-2">
								Ausgewähltes Gerät: {deviceLabels[selectedDevice()!]}
							</h4>
							<p class="text-sm text-gray-600">
								{selectedDevice() === "heltec-lora32"
									? "Heltec LoRa32 mit integriertem Display und LoRa-Modul"
									: "Generic ESP32 Board für benutzerdefinierte Konfiguration"}
							</p>
						</div>
					)}
				</div>

				{props.error && (
					<div class="bg-red-50 border border-red-200 rounded-md p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg
									class="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-red-800">
									Verbindungsfehler
								</h3>
								<div class="mt-2 text-sm text-red-700">
									<p>{props.error}</p>
								</div>
							</div>
						</div>
					</div>
				)}

				<ErrorList errors={errors()} />

				<div class="flex justify-end space-x-3">
					{props.error ? (
						<ButtonAction type="secondary" onClick={handleRetry}>
							Erneut versuchen
						</ButtonAction>
					) : (
						<ButtonAction
							type="primary"
							onClick={handleConnect}
							loading={isConnecting()}
							disabled={!selectedDevice() || isConnecting()}
						>
							{isConnecting() ? "Verbinde..." : "Verbinden"}
						</ButtonAction>
					)}
				</div>
			</div>
		</FormLayout>
	);
};

export { StepConnectConnectingForm };
