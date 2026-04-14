import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { Button } from "@/components/atoms/Button.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartWaitingForUser({
	state,
	emitEvent,
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
				<div class="rounded-lg border border-border bg-card/60 p-5 shadow-sm ring-1 ring-border/40 backdrop-blur supports-[backdrop-filter]:bg-card/50 sm:p-6 dark:bg-card/70 dark:ring-border/50">
					<p class="mb-4 text-sm font-medium text-foreground">
						The installation steps are as follows:
					</p>
					<ol
						class="flex list-none flex-col gap-5"
						aria-label="Installation steps"
					>
						<li class="flex gap-4">
							<span
								class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold tabular-nums text-primary"
								aria-hidden="true"
							>
								1
							</span>
							<span class="pt-1.5 text-base leading-relaxed text-foreground">
								Connect your microcontroller with a USB cable to
								your computer.
							</span>
						</li>
						<li class="flex gap-4">
							<span
								class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold tabular-nums text-primary"
								aria-hidden="true"
							>
								2
							</span>
							<span class="pt-1.5 text-base leading-relaxed text-foreground">
								Select the microcontroller type from the drop-down.
							</span>
						</li>
						<li class="flex gap-4">
							<span
								class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold tabular-nums text-primary"
								aria-hidden="true"
							>
								3
							</span>
							<span class="pt-1.5 text-base leading-relaxed text-foreground">
								Click the install button.
							</span>
						</li>
					</ol>
				</div>

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
