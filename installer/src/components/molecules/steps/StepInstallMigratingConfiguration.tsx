import {
	AlertDescription,
	AlertInline,
	AlertTitle,
} from "@/components/molecules/AlertInline.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepInstallMigratingConfiguration({
	state,
	emitEvent,
}: StepProps) {
	return (
		<AlertInline>
			<AlertTitle>Migrating configuration</AlertTitle>
			<AlertDescription>Keeping your settings safe.</AlertDescription>
		</AlertInline>
	);
}
