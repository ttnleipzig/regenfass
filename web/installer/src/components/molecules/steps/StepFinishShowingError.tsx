import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Button,
} from "@regenfass/brand";
import { useInstallerT } from "@/i18n/index.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepFinishShowingError({ state, emitEvent }: StepProps) {
	const t = useInstallerT();

	return (
		<div class="space-y-3">
			<AlertInline variant="destructive">
				<AlertTitle>{t("finishShowingError.title")}</AlertTitle>
				<AlertDescription>
					{(state.context.error as unknown as Error).toString()}
					{(state.context.error as unknown as Error).stack}
					{JSON.stringify((state.context.error as unknown as Error).cause!)}
				</AlertDescription>
			</AlertInline>
			<div class="pt-1">
				<Button onClick={() => emitEvent({ type: "restart" })}>
					{t("finishShowingError.restart")}
				</Button>
			</div>
		</div>
	);
}
