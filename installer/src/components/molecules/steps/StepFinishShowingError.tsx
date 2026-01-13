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

export default function StepFinishShowingError({ state, emitEvent }: StepProps) {
	return (
		<div class="space-y-3">
			<AlertInline variant="destructive">
				<AlertTitle>Critical error</AlertTitle>
				<AlertDescription>
					{(state.context.error as unknown as Error).toString()}
					{(state.context.error as unknown as Error).stack}
					{JSON.stringify(
						(state.context.error as unknown as Error).cause!
					)}
				</AlertDescription>
			</AlertInline>
			<div class="pt-1">
				<Button onClick={() => emitEvent({ type: "restart" })}>
					Restart
				</Button>
			</div>
		</div>
	);
}
