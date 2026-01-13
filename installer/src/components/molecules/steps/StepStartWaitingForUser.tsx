import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";
import { Button } from "@/components/atoms/Button.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartWaitingForUser({ state, emitEvent }: StepProps) {
	return (
		<div class="space-y-4">
			<AlertInline>
				<AlertTitle>Waiting for your confirmation</AlertTitle>
				<AlertDescription>Please confirm to continue.</AlertDescription>
			</AlertInline>
			<div class="pt-1">
				<Button onClick={() => emitEvent({ type: "start.next" })}>
					Next
				</Button>
			</div>
		</div>
	);
}
