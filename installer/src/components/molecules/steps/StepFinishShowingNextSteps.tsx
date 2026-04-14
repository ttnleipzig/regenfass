import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { cn } from "@/libs/cn.ts";
import { CircleCheck } from "lucide-solid";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepFinishShowingNextSteps({
	state,
	emitEvent,
}: StepProps) {
	void state;
	void emitEvent;

	return (
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
								"text-muted-foreground",
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
						Next steps
					</AlertTitle>
					<AlertDescription
						class={cn(
							"text-sm leading-relaxed text-muted-foreground",
							"motion-safe:animate-success-rise motion-safe:[animation-delay:180ms]",
						)}
					>
						All set. You can now use your device.
					</AlertDescription>
				</div>
			</div>
		</AlertInline>
	);
}
