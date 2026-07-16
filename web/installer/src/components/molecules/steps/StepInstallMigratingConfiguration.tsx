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

export default function StepInstallMigratingConfiguration({
	state: _state,
	emitEvent: _emitEvent,
}: StepProps) {
	const t = useInstallerT();

	return (
		<AlertInline>
			<AlertTitle>{t("installMigratingConfiguration.title")}</AlertTitle>
			<AlertDescription>
				{t("installMigratingConfiguration.description")}
			</AlertDescription>
		</AlertInline>
	);
}
