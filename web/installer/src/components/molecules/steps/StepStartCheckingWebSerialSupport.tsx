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

export default function StepStartCheckingWebSerialSupport({
	state: _state,
	emitEvent: _emitEvent,
}: StepProps) {
	const t = useInstallerT();

	return (
		<AlertInline>
			<AlertTitle>{t("startCheckingWebSerialSupport.title")}</AlertTitle>
			<AlertDescription>
				{t("startCheckingWebSerialSupport.description")}
			</AlertDescription>
		</AlertInline>
	);
}
