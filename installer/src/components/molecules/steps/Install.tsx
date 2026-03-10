import { Step } from "@/libs/steps";

export const installStep = {
	title: "Install",
	render: InstallationStep,
} satisfies Step;

function InstallationStep() {
	return (
		<div class="space-y-4">
			{/* Use shared Headline for consistency */}
			{/* @ts-ignore */}
			<div class="text-2xl font-bold">Installation</div>
		</div>
	);
}
