import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@regenfass/brand";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConnectConnecting({ state, emitEvent }: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Connecting</AlertTitle>
			<AlertDescription>Trying to connect to your device.</AlertDescription>
		</AlertInline>
	);
}
