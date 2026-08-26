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

function isUsbConnectionError(error: unknown) {
	if (!error || typeof error !== "object") return false;

	const candidate = error as { name?: unknown; message?: unknown };
	return (
		candidate.name === "NotFoundError" ||
		(typeof candidate.message === "string" && candidate.message.includes("requestPort"))
	);
}

export default function StepFinishShowingError({ state, emitEvent }: StepProps) {
	const t = useInstallerT();
	const error = state.context.error as unknown;
	const usbError = isUsbConnectionError(error);

	return (
		<div class="space-y-3">
			<AlertInline variant="destructive">
				<AlertTitle>
					{usbError ? t("finishShowingError.usbTitle") : t("finishShowingError.title")}
				</AlertTitle>
				<AlertDescription>
					{usbError
						? t("finishShowingError.usbDescription")
						: (error as Error).toString()}
					{!usbError && (error as Error).stack}
					{!usbError && JSON.stringify((error as Error).cause!)}
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
