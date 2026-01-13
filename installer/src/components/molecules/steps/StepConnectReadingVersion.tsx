import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConnectReadingVersion({ state, emitEvent }: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Reading firmware version</AlertTitle>
			<AlertDescription>Gathering device information.</AlertDescription>
		</AlertInline>
	);
}
