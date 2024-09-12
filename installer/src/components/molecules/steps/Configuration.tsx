import { Step } from "@/libs/steps";

export const configurationStep = {
	title: "Configuration",
	render: ConfigurationStep,
} satisfies Step;

function ConfigurationStep() {
	return (
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Configuration</h2>
			<p>Configure your application!</p>
		</div>
	);
}
