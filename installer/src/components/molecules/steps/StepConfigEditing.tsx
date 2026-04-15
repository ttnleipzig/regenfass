import {
	IconClearAll,
	IconDeviceFloppy,
	IconFileExport,
	IconFileImport,
} from "@tabler/icons-solidjs";
import { For } from "solid-js";
import { Button } from "@/components/atoms/Button.tsx";
import { AppKeyHexField } from "@/components/forms/AppKeyHexField.tsx";
import { TextFieldRoot } from "@/components/forms/TextField.tsx";
import {
	OTPField,
	OTPFieldGroup,
	OTPFieldInput,
	OTPFieldSlot,
} from "@/components/molecules/OTPField.tsx";

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
			<label
				class="block text-sm font-medium leading-none tracking-tight text-foreground"
				for={props.inputId}
			>
				<span class="font-mono text-xs uppercase text-muted-foreground">
					{props.labelText}
				</span>
			</label>
			<OTPField
				class="mt-2 gap-1.5"
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
		<div class="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50 dark:ring-border/80">
			<header class="mb-6 space-y-1.5 border-b border-border pb-5">
				<h2 class="text-base font-semibold leading-tight tracking-tight text-foreground">
					Device credentials
				</h2>
				<p class="max-w-prose text-sm leading-relaxed text-muted-foreground">
					These values identify your device on the network. Use hex digits only; the app key stays hidden until you choose to reveal it.
				</p>
			</header>

			<div class="space-y-6">
				{/* TODO: Autogenerate fields from ConfigV<T> objects */}
				<TextFieldRoot class="space-y-0">
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

				<TextFieldRoot class="space-y-0">
					<label
						class="block text-sm font-medium leading-none tracking-tight text-foreground"
						for="appKey-input"
					>
						<span class="font-mono text-xs uppercase text-muted-foreground">appKey</span>
					</label>
					<div class="mt-2">
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
					</div>
				</TextFieldRoot>

				<TextFieldRoot class="space-y-0">
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
			</div>

			<footer class="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<div class="flex flex-wrap gap-2">
					<Button
						class="gap-1.5"
						variant="outline"
						size="sm"
						onClick={() => emitEvent({ type: "config.clear" })}
					>
						<IconClearAll aria-hidden={true} size={16} stroke="1.75" />
						clear
					</Button>
					<Button
						class="gap-1.5"
						variant="outline"
						size="sm"
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
						<IconFileImport aria-hidden={true} size={16} stroke="1.75" />
						load from file
					</Button>
					<Button
						class="gap-1.5"
						variant="outline"
						size="sm"
						onClick={() => emitEvent({ type: "config.saveToFile" })}
					>
						<IconFileExport aria-hidden={true} size={16} stroke="1.75" />
						save to file
					</Button>
				</div>
				<Button
					class="gap-1.5 sm:min-w-[7rem]"
					onClick={() => emitEvent({ type: "config.next" })}
				>
					<IconDeviceFloppy aria-hidden={true} size={16} stroke="1.75" />
					Save to device
				</Button>
			</footer>
		</div>
	);
}
