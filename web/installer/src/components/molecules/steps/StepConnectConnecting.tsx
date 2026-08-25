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

export default function StepConnectConnecting({
	state: _state,
	emitEvent: _emitEvent,
}: StepProps) {
	const t = useInstallerT();

	return (
		<AlertInline>
			<AlertTitle>{t("connectConnecting.title")}</AlertTitle>
			<AlertDescription>{t("connectConnecting.description")}</AlertDescription>
		</AlertInline>
	);
}
