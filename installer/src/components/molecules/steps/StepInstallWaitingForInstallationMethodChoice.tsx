import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { Button } from "@/components/atoms/Button.tsx";
import {
	SelectContent,
	SelectField,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/forms/SelectField.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepInstallWaitingForInstallationMethodChoice({
	state,
	emitEvent,
}: StepProps) {
	return (
		<div class="space-y-4">
			<AlertInline>
				<AlertTitle>Choose installation method</AlertTitle>
				<AlertDescription>
					Install fresh or update existing firmware.
				</AlertDescription>
			</AlertInline>
			<div class="flex gap-3">
				<Button
					disabled={!state.can({ type: "install.install" })}
					onClick={() => emitEvent({ type: "install.install" })}
				>
					Install
				</Button>
				<Button
					disabled={!state.can({ type: "install.configure" })}
					onClick={() => emitEvent({ type: "install.configure" })}
				>
					Configure
				</Button>
			</div>

			<SelectField
				value={state.context.targetFirmwareVersion}
				options={state.context.upstreamVersions}
				placeholder="SelectField a version"
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
					<SelectValue<string>>
						{(state) => state.selectedOption()}
					</SelectValue>
				</SelectTrigger>
				<SelectContent />
			</SelectField>
		</div>
	);
}
