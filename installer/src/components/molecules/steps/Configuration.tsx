import { Step } from "@/libs/steps";

export const configurationStep = {
	title: "Configuration",
	render: ConfigurationStep,
} satisfies Step;

function ConfigurationStep() {
	return (
		<div class="space-y-4">
			{/* Use shared Headline */}
			{/* @ts-ignore: file context omitted */}
			<div>
				{/* Replace raw h2 with Headline for consistent style */}
			</div>
			<p>Configure your application!</p>
		</div>
	);
}
