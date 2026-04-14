import { Spinner } from "@/components/atoms/Spinner.tsx";
import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { Progress } from "@/components/atoms/Progress.tsx";
import { cn } from "@/libs/cn.ts";
import { CircleCheck } from "lucide-solid";
import { createMemo, Show } from "solid-js";

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
					variant="success"
					showIcon={false}
					class={cn(
						"mt-4 shadow-sm",
						"[&:has(svg)]:px-6 sm:[&:has(svg)]:px-7",
					)}
				>
					<div class="flex gap-4 sm:items-start">
						<div class="relative flex size-12 shrink-0 items-center justify-center">
							<div
								class={cn(
									"relative z-10 flex size-12 items-center justify-center rounded-full",
									"bg-muted/80 ring-1 ring-border/60",
								)}
							>
								<CircleCheck
									class={cn(
										"text-success",
										"motion-safe:animate-success-check",
									)}
									size={26}
									strokeWidth={2.25}
									aria-hidden="true"
								/>
							</div>
						</div>
						<div class="min-w-0 flex-1 space-y-1.5 pt-0.5">
							<AlertTitle
								class={cn(
									"text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.0625rem]",
									"motion-safe:animate-success-rise motion-safe:[animation-delay:90ms]",
								)}
							>
								Installation successful
							</AlertTitle>
							<AlertDescription
								class={cn(
									"flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground",
									"motion-safe:animate-success-rise motion-safe:[animation-delay:180ms]",
								)}
							>
								<p>The firmware was installed successfully.</p>
								<p>
									The next step is configuration. You will be taken there
									automatically in a moment.
								</p>
							</AlertDescription>
						</div>
					</div>
				</AlertInline>
			</Show>
		</>
	);
}
