import { Spinner } from "@/components/atoms/Spinner.tsx";
import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { cn } from "@/libs/cn.ts";
import { createMemo } from "solid-js";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepInstallInstalling(props: StepProps) {
	const progressRatio = createMemo(() => {
		const p = props.state.context?.installFlashProgress;
		if (typeof p !== "number" || Number.isNaN(p)) {
			return 0;
		}
		return Math.min(1, Math.max(0, p));
	});

	const progressPercent = createMemo(() => Math.round(progressRatio() * 100));

	return (
		<AlertInline
			variant="info"
			class={cn(
				"shadow-sm",
				"dark:bg-card/92 dark:ring-border/90",
			)}
		>
			<AlertTitle
				class={cn(
					"flex items-center gap-3 text-base sm:text-lg",
					"leading-snug tracking-tight",
				)}
			>
				<Spinner size="lg" class="shrink-0 text-info" />
				<span>Installing firmware</span>
			</AlertTitle>
			<AlertDescription class="mt-1 flex flex-col gap-4">
				<p class="text-muted-foreground">
					Firmware is being written to the microcontroller over USB—please keep the
					cable connected until this finishes.
				</p>

				<div
					class={cn(
						"flex flex-col gap-3 rounded-lg border border-border/70",
						"bg-muted/50 p-3 shadow-inner sm:p-4",
						"dark:border-border dark:bg-background/85",
					)}
					role="status"
					aria-live="polite"
					aria-busy={true}
					aria-label="Firmware installation progress"
				>
					<div class="flex items-baseline justify-between gap-3">
						<span class="text-sm font-medium leading-none text-foreground">
							Upload progress
						</span>
						<span
							class="tabular-nums text-sm font-semibold tracking-tight text-foreground"
							aria-hidden={true}
						>
							{progressPercent()}%
						</span>
					</div>
					<Progress
						value={progressPercent()}
						getValueLabel={() => `${progressPercent()} percent`}
						class="gap-0"
					/>
				</div>
			</AlertDescription>
		</AlertInline>
	);
}
