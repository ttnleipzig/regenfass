import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepStartFetchUpstreamVersions({
	state,
	emitEvent,
}: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Fetching versions</AlertTitle>
			<AlertDescription>
				Getting the latest available firmware versions.
			</AlertDescription>
		</AlertInline>
	);
}
