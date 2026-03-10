import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartCheckingWebSerialSupport({
	state,
	emitEvent,
}: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Checking Web Serial support</AlertTitle>
			<AlertDescription>
				We are verifying that your browser supports the Web Serial API.
			</AlertDescription>
		</AlertInline>
	);
}
