import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { StepPaginator } from "@/components/molecules/StepPaginator.tsx";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";
import { Button } from "@/components/atoms/Button.tsx";

/** Labels align with `getInstallationActiveStep`: connect phase → method choice → `Install_Installing`. */
export const INSTALLATION_STEPS = [
	"Confirm to start, connect your board over USB, choose the device type, then read the firmware version from the device.",
	"Pick a firmware version from the list, then choose Install or Configure.",
	"Wait while the installer flashes firmware to your device.",
] as const;

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartWaitingForUser({ state, emitEvent }: StepProps) {
	return (
		<div class="flex w-full min-w-0 flex-col gap-8">
			<section class="space-y-4">
				<h1 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					Hi there! 👋
				</h1>
				<p class="text-lg leading-relaxed text-muted-foreground">
					This project is about a smart water tank. It measures the
					water level and sends the data to a server. The server can be
					used to control the water pump. The pump can be controlled
					via a web interface or via a telegram bot. It uses an HC-SR04
					ultrasonic sensor to measure the water level. The data is
					sent to{" "}
					<span class="bg-gradient-to-br from-primary to-sky-500 bg-clip-text font-medium text-transparent">
						The Things Network
					</span>{" "}
					via a{" "}
					<span class="bg-gradient-to-br from-primary to-sky-500 bg-clip-text font-medium text-transparent">
						LoRaWAN
					</span>{" "}
					gateway.
				</p>
			</section>

			<AlertInline variant="info">
				<AlertTitle>Waiting for your confirmation</AlertTitle>
				<AlertDescription>Please confirm to continue.</AlertDescription>
			</AlertInline>

			<div class="space-y-6">
				<StepPaginator
					title="Installation"
					steps={INSTALLATION_STEPS}
					listAriaLabel="Installation steps"
					activeStep={getInstallationActiveStep(state)}
				/>

				<div class="flex justify-stretch sm:justify-end">
					<Button
						class="w-full sm:w-auto"
						size="lg"
						onClick={() => emitEvent({ type: "start.next" })}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
