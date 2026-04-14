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
		<div class="space-y-4">
			<section class="max-w-screen-lg px-3 py-6 mx-auto">
				<div class="flex flex-col items-center md:flex-row md:justify-between md:gap-x-24">
					<div>
						<h1 class="text-3xl font-bold">Hi there! 👋</h1>
						<p class="mt-6 text-xl leading-9">
							This project is about a smart water tank. It
							measures the water level and sends the data to a
							server. The server can be used to control the water
							pump. The pump can be controlled via a web interface
							or via a telegram bot. It uses a HC-SR04 ultrasonic
							sensor to measure the water level. The data is sent
							to
							<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
								The Things Network
							</span>
							via a
							<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
								LoRaWAN</span>
							gateway.
						</p>
					</div>
				</div>
			</section>
			<AlertInline>
				<AlertTitle>Waiting for your confirmation</AlertTitle>
				<AlertDescription>Please confirm to continue.</AlertDescription>
			</AlertInline>
			<div class="pt-1">
				<div class="p-4 text-lg">
					<ol class="ml-4 text-gray-700 list-inside dark:text-gray-400">
						<li class="flex items-center gap-3">
							<span class="text-4xl text-sky-500">❶</span>
							<span>
								Connect your microcontroller with an USB cable to your computer.
							</span>
						</li>
						<li class="flex items-center gap-3">
							<span class="text-4xl text-sky-500">❷</span>
							<span>Select the microcontroller type from the drop down.</span>
						</li>
						<li class="flex items-center gap-3">
							<span class="text-4xl text-sky-500">❸</span>
							<span>Click the install button.</span>
						</li>
					</ol>
				</div>
				<Button onClick={() => emitEvent({ type: "start.next" })}>Next</Button>
			</div>
		</div>
	);
}
