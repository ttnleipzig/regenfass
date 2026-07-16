import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	StepPaginator,
} from "@regenfass/brand";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";
import { useInstallerT } from "@/i18n/index.ts";
import { installationSteps } from "@/i18n/installationSteps.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConnectReadingVersion({
	state,
	emitEvent: _emitEvent,
}: StepProps) {
	const t = useInstallerT();

	return (
		<div class="flex w-full min-w-0 flex-col gap-8">
			<AlertInline>
				<AlertTitle>{t("connectReadingVersion.title")}</AlertTitle>
				<AlertDescription>
					{t("connectReadingVersion.description")}
				</AlertDescription>
			</AlertInline>

			<StepPaginator
				title={t("shared.paginatorTitle")}
				steps={installationSteps(t)}
				listAriaLabel={t("shared.paginatorListAriaLabel")}
				activeStep={getInstallationActiveStep(state)}
			/>
		</div>
	);
}
