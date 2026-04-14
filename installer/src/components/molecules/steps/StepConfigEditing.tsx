import { For } from "solid-js";
import { Button } from "@/components/atoms/Button.tsx";
import { AppKeyHexField } from "@/components/forms/AppKeyHexField.tsx";
import { TextFieldRoot } from "@/components/forms/TextField.tsx";
import {
	OTPField,
	OTPFieldGroup,
	OTPFieldInput,
	OTPFieldSlot,
} from "@/components/ui/otp-field.tsx";

interface StepProps {
	state: any;
	emitEvent: (event: any) => void;
}

type HexOtp16Field = "appEUI" | "devEUI";

function HexOtp16(props: {
	labelText: string;
	inputId: string;
	field: HexOtp16Field;
	value: string;
	onValueChange: (value: string) => void;
}) {
	return (
		<>
			<label class="block text-sm font-medium text-foreground" for={props.inputId}>
				{props.labelText}
			</label>
			<OTPField
				maxLength={16}
				value={props.value}
				onValueChange={props.onValueChange}
			>
				<OTPFieldInput
					id={props.inputId}
					name={props.field}
					pattern="^[0-9A-Fa-f]*$"
					autocomplete="off"
				/>
				<For each={[0, 2, 4, 6, 8, 10, 12, 14]}>
					{(pairStart) => (
						<OTPFieldGroup>
							<OTPFieldSlot index={pairStart} />
							<OTPFieldSlot index={pairStart + 1} />
						</OTPFieldGroup>
					)}
				</For>
			</OTPField>
		</>
	);
}

export default function StepConfigEditing({ state, emitEvent }: StepProps) {
	return (
		<div class="space-y-3">
			{/* TODO: Autogenerate fields from ConfigV<T> objects */}
			<TextFieldRoot>
				<HexOtp16
					labelText="appEUI"
					inputId="appEUI-otp"
					field="appEUI"
					value={state.context.deviceInfo.config.appEUI}
					onValueChange={(value) =>
						emitEvent({
							type: "config.changeField",
							field: "appEUI",
							value,
						})
					}
				/>
			</TextFieldRoot>
			<TextFieldRoot>
				<label class="block text-sm font-medium text-foreground" for="appKey-input">
					appKey
				</label>
				<AppKeyHexField
					id="appKey-input"
					name="appKey"
					value={state.context.deviceInfo.config.appKey ?? ""}
					onCanonicalChange={(next) => {
						if (next !== (state.context.deviceInfo.config.appKey ?? "")) {
							emitEvent({
								type: "config.changeField",
								field: "appKey",
								value: next,
							});
						}
					}}
				/>
			</TextFieldRoot>
			<TextFieldRoot>
				<HexOtp16
					labelText="devEUI"
					inputId="devEUI-otp"
					field="devEUI"
					value={state.context.deviceInfo.config.devEUI}
					onValueChange={(value) =>
						emitEvent({
							type: "config.changeField",
							field: "devEUI",
							value,
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
