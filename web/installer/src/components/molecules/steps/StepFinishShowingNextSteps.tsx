import {
	AlertDescription,
	AlertInline,
	AlertTitle,
	Button,
} from "@regenfass/brand";
import { cn } from "@/libs/cn.ts";
import CircleCheck from "lucide-solid/icons/circle-check";
import { useInstallerT } from "@/i18n/index.ts";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepFinishShowingNextSteps({
	state,
	emitEvent,
}: StepProps) {
	void state;
	const t = useInstallerT();

	return (
		<div class="space-y-3">
			<AlertInline
				class={cn(
					// Override default extra left padding when any SVG is nested (our icon is in-flow).
					"[&:has(svg)]:px-6 sm:[&:has(svg)]:px-7",
					"border-border/70 bg-card/80 shadow-sm dark:bg-card/75",
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
							{t("finishShowingNextSteps.title")}
						</AlertTitle>
						<AlertDescription
							class={cn(
								"text-sm leading-relaxed text-muted-foreground",
								"motion-safe:animate-success-rise motion-safe:[animation-delay:180ms]",
							)}
						>
							{t("finishShowingNextSteps.body")}
						</AlertDescription>
						<AlertDescription
							class={cn(
								"text-sm leading-relaxed text-muted-foreground",
								"motion-safe:animate-success-rise motion-safe:[animation-delay:270ms]",
							)}
						>
							{t("finishShowingNextSteps.anotherDevice")}
						</AlertDescription>
					</div>
				</div>
			</AlertInline>
			<div class="flex justify-stretch pt-1 sm:justify-end">
				<Button
					variant="outline"
					class="w-full sm:w-auto"
					onClick={() => emitEvent({ type: "restart" })}
				>
					{t("finishShowingNextSteps.flashAnotherDevice")}
				</Button>
			</div>
		</div>
	);
}
