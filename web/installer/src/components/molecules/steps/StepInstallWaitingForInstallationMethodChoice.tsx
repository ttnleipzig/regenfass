import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Button,
	SelectContent,
	SelectField,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StepPaginator,
} from "@regenfass/brand";
import { getInstallationActiveStep } from "@/libs/install/installationActiveStep.ts";
import { useInstallerT } from "@/i18n/index.ts";
import { installationSteps } from "@/i18n/installationSteps.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepInstallWaitingForInstallationMethodChoice({
	state,
	emitEvent,
}: StepProps) {
	const t = useInstallerT();

	return (
		<div class="space-y-4">
			<StepPaginator
				title={t("shared.paginatorTitle")}
				steps={installationSteps(t)}
				listAriaLabel={t("shared.paginatorListAriaLabel")}
				activeStep={getInstallationActiveStep(state)}
			/>

			<AlertInline>
				<AlertTitle>
					{t("installWaitingForInstallationMethodChoice.alertTitle")}
				</AlertTitle>
				<AlertDescription>
					{t("installWaitingForInstallationMethodChoice.alertDescription")}
				</AlertDescription>
			</AlertInline>

			<div class="flex gap-3">
				<Button
					disabled={!state.can({ type: "install.install" })}
					onClick={() => emitEvent({ type: "install.install" })}
				>
					{t("installWaitingForInstallationMethodChoice.install")}
				</Button>
				<Button
					disabled={!state.can({ type: "install.configure" })}
					onClick={() => emitEvent({ type: "install.configure" })}
				>
					{t("installWaitingForInstallationMethodChoice.configure")}
				</Button>
			</div>

			<SelectField
				value={state.context.targetFirmwareVersion}
				options={state.context.upstreamVersions}
				placeholder={t(
					"installWaitingForInstallationMethodChoice.versionSelectPlaceholder",
				)}
				onChange={(version) =>
					emitEvent({
						type: "install.target_version_selected",
						version: version,
					})
				}
				itemComponent={(props) => (
					<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
				)}
			>
				<SelectTrigger class="w-[180px]">
					<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
				</SelectTrigger>
				<SelectContent />
			</SelectField>
		</div>
	);
}
