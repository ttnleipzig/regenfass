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
	state: _state,
	emitEvent: _emitEvent,
}: StepProps) {
	return (
		<AlertInline class="overflow-hidden">
			<div class="flex gap-3">
				<div class="relative mt-0.5 shrink-0">
					<CircleCheck
						class={cn(
							"text-primary",
							"motion-safe:animate-success-check",
						)}
						size={24}
						aria-hidden="true"
					/>
				</div>
				<div class="min-w-0 flex-1 space-y-1">
					<AlertTitle
						class={cn(
							"motion-safe:animate-success-rise motion-safe:[animation-delay:90ms]",
						)}
					>
						Next steps
					</AlertTitle>
					<AlertDescription
						class={cn(
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
