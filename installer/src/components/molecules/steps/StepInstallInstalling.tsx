import { Spinner } from "@/components/atoms/Spinner.tsx";
import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { cn } from "@/libs/cn.ts";
import { CircleCheck } from "lucide-solid";
import { createMemo, Show } from "solid-js";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

const successAlertClass = cn(
	"mt-4 shadow-sm",
	"border-emerald-600/40 bg-emerald-500/10 text-emerald-950",
	"ring-1 ring-emerald-600/20",
	"dark:border-emerald-500/45 dark:bg-emerald-950/50 dark:text-emerald-50",
	"dark:ring-emerald-500/30",
);

export default function StepInstallInstalling(props: StepProps) {
	const progressRatio = createMemo(() => {
		const p = props.state.context?.installFlashProgress;
		if (typeof p !== "number" || Number.isNaN(p)) {
			return 0;
		}
		return Math.min(1, Math.max(0, p));
	});

	const progressPercent = createMemo(() => Math.round(progressRatio() * 100));

	const isComplete = createMemo(() => progressPercent() >= 100);

	return (
		<>
			<AlertInline
				variant="info"
				class={cn("shadow-sm", "dark:bg-card/92 dark:ring-border/90")}
			>
				<AlertTitle
					class={cn(
						"flex items-center gap-3 text-base sm:text-lg",
						"leading-snug tracking-tight",
					)}
				>
					<Show
						when={isComplete()}
						fallback={<Spinner size="lg" class="shrink-0 text-info" />}
					>
						<CircleCheck
							class="size-6 shrink-0 text-info"
							strokeWidth={2}
							aria-hidden={true}
						/>
					</Show>
					<span>
						{isComplete() ? "Installation complete" : "Installing firmware"}
					</span>
				</AlertTitle>
				<AlertDescription class="mt-1 flex flex-col gap-4">
					<Show when={!isComplete()}>
						<p class="text-muted-foreground">
							Firmware is being written to the microcontroller over USB—please
							keep the cable connected until this finishes.
						</p>
					</Show>

					<div
						class={cn(
							"flex flex-col gap-3 rounded-lg border border-border/70",
							"bg-muted/50 p-3 shadow-inner sm:p-4",
							"dark:border-border dark:bg-background/85",
						)}
						role="status"
						aria-live="polite"
						aria-busy={!isComplete()}
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

			<Show when={isComplete()}>
				<AlertInline
					variant="default"
					showIcon={false}
					class={successAlertClass}
				>
					<AlertTitle class="font-semibold text-emerald-950 dark:text-emerald-50">
						Installation successful
					</AlertTitle>
					<AlertDescription class="mt-1 flex flex-col gap-2 text-emerald-900/90 dark:text-emerald-100/90">
						<p>The firmware was installed successfully.</p>
						<p>
							The next step is configuration. You will be taken there
							automatically in a moment.
						</p>
					</AlertDescription>
				</AlertInline>
			</Show>
		</>
	);
}
