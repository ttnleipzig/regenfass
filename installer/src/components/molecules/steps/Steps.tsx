import { Button } from "@/components/ui/button";
import { cn } from "@/libs/cn";
import { Step } from "@/libs/steps";
import { Check, Circle } from "lucide-solid";
import { Accessor, createSignal } from "solid-js";

const StepIndicator = ({
	currentStep: currentStep,
	steps,
}: {
	currentStep: Accessor<number>;
	steps: Step[];
}) => {
	return (
		<div class="flex items-center justify-between mb-8 gap-4">
			{steps.map((step, index) => (
				<>
					<div class="flex flex-col items-center relative z-10">
						<div
							class={cn(
								`flex items-center justify-center w-10 h-10 rounded-full border-2`,
								index < currentStep()
									? "bg-gray-600 border-gray-500 text-primary dark:bg"
									: index === currentStep()
									? "border-primary text-primary bg-white"
									: "border-gray-300 text-gray-300 bg-white"
							)}
						>
							{index < currentStep() ? (
								<Check class="w-6 h-6" />
							) : (
								<Circle class="w-6 h-6" />
							)}
						</div>
						<div class="text-xs absolute -bottom-6 mt-2 text-center">
							<div
								class={
									index <= currentStep()
										? "font-medium"
										: "text-gray-500"
								}
							>
								{step.title}
							</div>
						</div>
					</div>

					{index < steps.length - 1 && (
						<div
							class="h-1 w-full relative bg-gray-200 rounded-full dark:bg-gray-700"
							aria-hidden="true"
						>
							<div
								class={cn(
									"h-1 inset-0 transition origin-left rounded-full scale-x-0 bg-gradient-to-br from-sky-500 to-cyan-400",
									currentStep() > index && "scale-x-100"
								)}
								aria-hidden="true"
							/>
						</div>
					)}
				</>
			))}
		</div>
	);
};

export default function Installer({
	title,
	steps,
}: {
	title: string;
	steps: Step[];
}) {
	const [currentStep, setCurrentStep] = createSignal(0);

	const handleNext = async () => {
		const current = currentStep();
		if (current > steps.length - 1) return; // no further steps

		const step = steps[current];
		if (!step) return; // ???

		const preNext = step.preNext ?? (() => Promise.resolve(true));
		if (!(await preNext())) return; // precondition not met

		setCurrentStep(current + 1);
	};
	const handlePrevious = () => setCurrentStep((s) => (s > 0 ? s - 1 : s));

	const canGoNext = () => {
		const current = currentStep();
		if (current === steps.length - 1) return false;

		const step = steps[currentStep()];
		if (!step) return false;
		if (!step.canGoNext) return true;

		return step.canGoNext();
	};

	return (
		<div>
			<div class="mb-8">
				<h1 class="text-3xl font-bold mb-6 text-center">{title}</h1>
				<StepIndicator currentStep={currentStep} steps={steps} />
			</div>
			<div class="mb-8 min-h-[200px] w-full flex-1">
				{steps[currentStep()].render()}
			</div>
			<div class="flex justify-between">
				<Button
					onClick={handlePrevious}
					disabled={currentStep() === 0}
					variant="outline"
				>
					Previous
				</Button>
				<Button onClick={handleNext} disabled={!canGoNext()}>
					{currentStep() === steps.length - 2 ? "Install" : "Next"}
				</Button>
			</div>
		</div>
	);
}
