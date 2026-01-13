interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConfigWritingConfiguration({
	state,
	emitEvent,
}: StepProps) {
	return <span>Writing configuration...</span>;
}
