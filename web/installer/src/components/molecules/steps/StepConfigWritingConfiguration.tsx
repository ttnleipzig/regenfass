import { Spinner } from "@regenfass/brand";
import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Progress,
} from "@regenfass/brand";
import { BiSolidMicrochip } from "solid-icons/bi";
import { createMemo } from "solid-js";
import { useInstallerT } from "@/i18n/index.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConfigWritingConfiguration({
	state,
	emitEvent: _emitEvent,
}: StepProps) {
	const t = useInstallerT();

	const progressRatio = createMemo(() => {
		const p = state.context?.configWriteProgress;
		if (typeof p !== "number" || Number.isNaN(p)) {
			return 0;
		}
		return Math.min(1, Math.max(0, p));
	});

	const progressPercent = createMemo(() => Math.round(progressRatio() * 100));

	return (
		<AlertInline>
			<AlertTitle class="flex items-center gap-2">
				<Spinner size="lg" />
				{t("configWritingConfiguration.title")}
			</AlertTitle>
			<AlertDescription class="flex flex-col gap-3">
				<p>{t("configWritingConfiguration.description")}</p>
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
						<span>{t("shared.uploadProgress")}</span>
						<span aria-hidden={true}>{progressPercent()}%</span>
					</div>
					<Progress
						value={progressPercent()}
						getValueLabel={() =>
							t("shared.progressPercent", { percent: progressPercent() })
						}
					/>
				</div>
				<div
					class="flex items-center gap-2 text-muted-foreground"
					aria-hidden={true}
				>
					<BiSolidMicrochip class="size-5 shrink-0 motion-safe:animate-pulse" />
					<div class="flex items-end gap-1 pb-0.5">
						<span class="motion-safe:animate-pulse h-3 w-1 rounded-sm bg-primary/70" />
						<span class="motion-safe:animate-pulse h-3 w-1 rounded-sm bg-primary/70 motion-safe:[animation-delay:150ms]" />
						<span class="motion-safe:animate-pulse h-3 w-1 rounded-sm bg-primary/70 motion-safe:[animation-delay:300ms]" />
					</div>
				</div>
			</AlertDescription>
		</AlertInline>
	);
}
