import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepFinishShowingNextSteps({
	state,
	emitEvent,
}: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Next steps</AlertTitle>
			<AlertDescription>
				All set. You can now use your device.
			</AlertDescription>
		</AlertInline>
	);
}
