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
import { Show } from "solid-js";
import { firmwareEnvironments } from "@/libs/install/firmware.ts";
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
				class="rounded-none border-0 shadow-none ring-0"
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

			<SelectField<string>
				value={state.context.targetEnvironment}
				options={[...firmwareEnvironments]}
				placeholder={t(
					"installWaitingForInstallationMethodChoice.environmentSelectPlaceholder",
				)}
				onChange={(environment) =>
					emitEvent({ type: "install.environment_selected", environment })
				}
				itemComponent={(props) => (
					<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
				)}
			>
				<SelectTrigger
					aria-label={t(
						"installWaitingForInstallationMethodChoice.environmentSelectPlaceholder",
					)}
					class="w-full"
				>
					<SelectValue<string>>
						{(selection) => selection.selectedOption()}
					</SelectValue>
				</SelectTrigger>
				<SelectContent />
			</SelectField>
			<Show
				when={
					state.context.targetEnvironment &&
					state.context.upstreamVersions.length === 0
				}
			>
				<p role="status">
					{t("installWaitingForInstallationMethodChoice.noFirmwareAvailable")}
				</p>
			</Show>

			<SelectField<string>
				disabled={
					!state.context.targetEnvironment ||
					state.context.upstreamVersions.length === 0
				}
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
				<SelectTrigger
					aria-label={t(
						"installWaitingForInstallationMethodChoice.versionSelectPlaceholder",
					)}
					class="w-[180px]"
				>
					<SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
				</SelectTrigger>
				<SelectContent />
			</SelectField>
		</div>
	);
}
