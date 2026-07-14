import { Step } from "@/libs/steps";

export const finishStep = {
	title: "Finish",
	render: FinishStep,
} satisfies Step;

function FinishStep() {
	return (
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Installation Complete</h2>
			<p>Thank you for installing our application!</p>
		</div>
	);
}
