import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@regenfass/brand";

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
