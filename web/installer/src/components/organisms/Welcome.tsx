import { cn } from "@/libs/cn.ts";

export default function Welcome() {
	return (
		<p class="text-foreground leading-7">
			This project measures water levels in tanks and barrels and sends
			the readings to a server. You can connect different sensors and
			view their data in a dashboard. It uses an HC-SR04 ultrasonic sensor
			to measure the water level. The data is sent to{" "}
			<span class={cn(
				"text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text",
				"font-semibold"
			)}>
				The Things Network
			</span>{" "}
			via a{" "}
			<span class={cn(
				"text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text",
				"font-semibold"
			)}>
				LoRaWAN
			</span>{" "}
			gateway.
		</p>
	);
}
