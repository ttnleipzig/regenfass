import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { StepPaginator } from "@/components/molecules/StepPaginator.tsx";
import { INSTALLATION_STEPS } from "@/components/molecules/steps/StepStartWaitingForUser.tsx";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConnectReadingVersion({ state, emitEvent }: StepProps) {
	return (
		<div class="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-6 sm:px-6">
			<AlertInline>
				<AlertTitle>Reading firmware version</AlertTitle>
				<AlertDescription>Gathering device information.</AlertDescription>
			</AlertInline>

			<StepPaginator
				title="Installation"
				steps={INSTALLATION_STEPS}
				listAriaLabel="Installation steps"
				activeStep={getInstallationActiveStep(state)}
			/>
		</div>
	);
}
