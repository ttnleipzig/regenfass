import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepInstallInstalling({ state, emitEvent }: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Installing</AlertTitle>
			<AlertDescription>Flashing firmware to the device...</AlertDescription>
		</AlertInline>
	);
}
