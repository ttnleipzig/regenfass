import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@regenfass/brand";
import { useInstallerT } from "@/i18n/index.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartFetchUpstreamVersions({
	state: _state,
	emitEvent: _emitEvent,
}: StepProps) {
	const t = useInstallerT();

	return (
		<AlertInline>
			<AlertTitle>{t("startFetchUpstreamVersions.title")}</AlertTitle>
			<AlertDescription>
				{t("startFetchUpstreamVersions.description")}
			</AlertDescription>
		</AlertInline>
	);
}
