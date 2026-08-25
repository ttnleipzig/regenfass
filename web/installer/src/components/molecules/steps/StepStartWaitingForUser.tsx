import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Button,
	StepPaginator,
} from "@regenfass/brand";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";
import { useInstallerT } from "@/i18n/index.ts";
import {
	INSTALLATION_STEPS,
	installationSteps,
} from "@/i18n/installationSteps.ts";

/** @deprecated Prefer `installationSteps(t)` — kept for tests. */
export { INSTALLATION_STEPS };

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartWaitingForUser({ state, emitEvent }: StepProps) {
	const t = useInstallerT();

	return (
		<div class="flex w-full min-w-0 flex-col gap-8">
			<section class="space-y-4">
				<h1 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					{t("startWaitingForUser.heading")}
				</h1>
				<p class="text-lg leading-relaxed text-muted-foreground">
					{t("startWaitingForUser.introBeforeTtn")}{" "}
					<span class="bg-gradient-to-br from-primary to-sky-500 bg-clip-text font-medium text-transparent">
						{t("startWaitingForUser.brandTheThingsNetwork")}
					</span>{" "}
					{t("startWaitingForUser.introVia")}{" "}
					<span class="bg-gradient-to-br from-primary to-sky-500 bg-clip-text font-medium text-transparent">
						{t("startWaitingForUser.brandLoRaWAN")}
					</span>{" "}
					{t("startWaitingForUser.introAfterLorawan")}
				</p>
			</section>

			<AlertInline variant="info">
				<AlertTitle>{t("startWaitingForUser.alertTitle")}</AlertTitle>
				<AlertDescription>
					{t("startWaitingForUser.alertDescription")}
				</AlertDescription>
			</AlertInline>

			<div class="space-y-6">
				<StepPaginator
					title={t("shared.paginatorTitle")}
					steps={installationSteps(t)}
					listAriaLabel={t("shared.paginatorListAriaLabel")}
					activeStep={getInstallationActiveStep(state)}
				/>

				<div class="flex justify-stretch sm:justify-end">
					<Button
						class="w-full sm:w-auto"
						size="lg"
						onClick={() => emitEvent({ type: "start.next" })}
					>
						{t("startWaitingForUser.next")}
					</Button>
				</div>
			</div>
		</div>
	);
}
