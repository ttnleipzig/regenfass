import { Step } from "@/libs/steps";

export const installStep = {
	title: "Install",
	render: InstallationStep,
} satisfies Step;

function InstallationStep() {
	return (
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Installation</h2>
		</div>
	);
}
