import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Button,
	StepPaginator,
} from "@regenfass/brand";
import Usb from "lucide-solid/icons/usb";
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

			<AlertInline variant="info" icon={<Usb size={16} aria-hidden="true" />}>
				<AlertTitle>{t("startWaitingForUser.alertTitle")}</AlertTitle>
				<AlertDescription>
					{t("startWaitingForUser.alertDescription")}
				</AlertDescription>
			</AlertInline>

			<p class="text-sm text-muted-foreground">
				{t("startWaitingForUser.helpText")} {" "}
				<a
					href="https://docs.regenfass.eu/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary underline underline-offset-4 hover:text-primary/80"
				>
					{t("startWaitingForUser.helpDocs")}
				</a>{" · "}
				<a
					href="https://regenfass.eu/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary underline underline-offset-4 hover:text-primary/80"
				>
					{t("startWaitingForUser.helpHomepage")}
				</a>{" · "}
				<a
					href="https://matrix.to/#/#ttn-leipzig:matrix.org"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-1 text-primary underline underline-offset-4 hover:text-primary/80"
				>
					{t("startWaitingForUser.helpMatrix")}
				</a>
			</p>

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
