import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@regenfass/brand";
import { StepPaginator } from "@regenfass/brand";
import { INSTALLATION_STEPS } from "@/components/molecules/steps/StepStartWaitingForUser.tsx";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConnectReadingVersion({ state, emitEvent }: StepProps) {
	return (
		<div class="flex w-full min-w-0 flex-col gap-8">
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
