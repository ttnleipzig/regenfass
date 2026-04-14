import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { StepPaginator } from "@/components/molecules/StepPaginator.tsx";
import { Button } from "@/components/atoms/Button.tsx";

export const INSTALLATION_STEPS = [
	"Connect your microcontroller with a USB cable to your computer.",
	"Select the microcontroller type from the drop-down.",
	"Click the install button.",
] as const;

/** 1-based step index matching the order of {@link INSTALLATION_STEPS}. */
export type InstallationWelcomeStep =
	InstallationStepIndices<typeof INSTALLATION_STEPS>;

type InstallationStepIndices<T extends readonly unknown[]> = T["length"] extends 0
	? never
	: number extends T["length"]
		? number
		: OneToN<T["length"]>;

/** Builds the union `1 | 2 | … | N` for a finite numeric literal `N`. */
type OneToN<
	N extends number,
	Acc extends unknown[] = [],
	R extends number[] = [],
> = Acc["length"] extends N
	? R[number]
	: OneToN<N, [...Acc, 0], [...R, [...Acc, 0]["length"]]>;

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
	/** Highlights this step in the list (1 = first line in {@link INSTALLATION_STEPS}). */
	activeInstallationStep?: InstallationWelcomeStep;
}

export default function StepStartWaitingForUser({
	state,
	emitEvent,
	activeInstallationStep,
}: StepProps) {
	return (
		<div class="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-6 sm:px-6">
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
					title="The installation steps are as follows:"
					steps={INSTALLATION_STEPS}
					listAriaLabel="Installation steps"
					activeStep={activeInstallationStep}
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
