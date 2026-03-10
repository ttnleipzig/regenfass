import { Button } from "@/components/atoms/Button.tsx";
import {
	TextFieldInput,
	TextFieldLabel,
	TextFieldRoot,
} from "@/components/forms/TextField.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

export default function StepConfigEditing({ state, emitEvent }: StepProps) {
	return (
		<div class="space-y-3">
			{/* TODO: Autogenerate fields from ConfigV<T> objects */}
			<TextFieldRoot>
				<TextFieldLabel>appEUI</TextFieldLabel>
				<TextFieldInput
					value={state.context.deviceInfo.config.appEUI}
					type="text"
					name="appEUI"
					onChange={(
						t: Event & {
							currentTarget: HTMLInputElement;
							target: HTMLInputElement;
						}
					) =>
						emitEvent({
							type: "config.changeField",
							field: "appEUI",
							value: t.currentTarget.value,
						})
					}
				/>
			</TextFieldRoot>
			<TextFieldRoot>
				<TextFieldLabel>appKey</TextFieldLabel>
				<TextFieldInput
					value={state.context.deviceInfo.config.appKey}
					type="text"
					name="appKey"
					onChange={(
						t: Event & {
							currentTarget: HTMLInputElement;
							target: HTMLInputElement;
						}
					) =>
						emitEvent({
							type: "config.changeField",
							field: "appKey",
							value: t.currentTarget.value,
						})
					}
				/>
			</TextFieldRoot>
			<TextFieldRoot>
				<TextFieldLabel>devEUI</TextFieldLabel>
				<TextFieldInput
					value={state.context.deviceInfo.config.devEUI}
					type="text"
					name="devEUI"
					onChange={(
						t: Event & {
							currentTarget: HTMLInputElement;
							target: HTMLInputElement;
						}
					) =>
						emitEvent({
							type: "config.changeField",
							field: "devEUI",
							value: t.currentTarget.value,
						})
					}
				/>
			</TextFieldRoot>
			<div class="flex gap-3 pt-2">
				<Button onClick={() => emitEvent({ type: "config.clear" })}>
					clear
				</Button>
				<Button
					onClick={() =>
						emitEvent({
							type: "config.loadFromFile",
							config: {
								appEUI: "",
								appKey: "",
								devEUI: "",
							},
						})
					}
				>
					load from file
				</Button>
				<Button onClick={() => emitEvent({ type: "config.saveToFile" })}>
					save to file
				</Button>
				<Button onClick={() => emitEvent({ type: "config.next" })}>
					next
				</Button>
			</div>
		</div>
	);
}
