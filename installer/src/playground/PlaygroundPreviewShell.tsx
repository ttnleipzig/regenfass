import type { JSX } from "solid-js";
import {
	AlertDialog,
	AlertDialogContent,
} from "@/components/molecules/AlertDialog.tsx";
import {
	SelectContent,
	SelectField,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/forms/SelectField.tsx";
import { TextFieldRoot } from "@/components/forms/TextField.tsx";

const PREVIEW_SELECT_OPTIONS = ["Preview A", "Preview B"];

type ShellProps = {
	componentName: string;
	children: JSX.Element;
};

export function PlaygroundPreviewShell(props: ShellProps) {
	const n = props.componentName;

	if (
		n === "AlertDialogTitle" ||
		n === "AlertDialogDescription" ||
		n === "AlertDialogClose" ||
		n === "AlertDialogAction"
	) {
		return (
			<AlertDialog defaultOpen>
				<AlertDialogContent>{props.children}</AlertDialogContent>
			</AlertDialog>
		);
	}

	if (n === "AlertDialogContent") {
		return <AlertDialog defaultOpen>{props.children}</AlertDialog>;
	}

	if (n === "SelectTrigger") {
		return (
			<SelectField
				options={PREVIEW_SELECT_OPTIONS}
				value={PREVIEW_SELECT_OPTIONS[0]}
				placeholder="Choose"
				onChange={() => {}}
				itemComponent={(p) => (
					<SelectItem item={p.item}>{String(p.item.rawValue)}</SelectItem>
				)}
			>
				{props.children}
				<SelectContent />
			</SelectField>
		);
	}

	if (n === "SelectContent") {
		return (
			<SelectField
				options={PREVIEW_SELECT_OPTIONS}
				value={PREVIEW_SELECT_OPTIONS[0]}
				placeholder="Choose"
				onChange={() => {}}
				itemComponent={(p) => (
					<SelectItem item={p.item}>{String(p.item.rawValue)}</SelectItem>
				)}
			>
				<SelectTrigger class="w-full">
					<SelectValue<string>>
						{(s) => (s.selectedOption() ? String(s.selectedOption()) : "Pick")}
					</SelectValue>
				</SelectTrigger>
				{props.children}
			</SelectField>
		);
	}

	if (
		n === "TextFieldLabel" ||
		n === "TextFieldInput" ||
		n === "TextFieldDescription" ||
		n === "TextFieldErrorMessage"
	) {
		return <TextFieldRoot>{props.children}</TextFieldRoot>;
	}

	return props.children;
}
