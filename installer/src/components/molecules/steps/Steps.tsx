import { AlertInline, AlertDescription, AlertTitle } from "@/components/molecules/AlertInline.tsx";
// Removed AlertDialog in favor of inline alert
import { Button } from "@/components/atoms/Button.tsx";
import {
	SelectField,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/forms/SelectField.tsx";
import {
	TextFieldInput,
	TextFieldLabel,
} from "@/components/forms/TextField.tsx";
import { setupStateMachine } from "@/libs/install/state.ts";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/solid";
import { Match, Switch } from "solid-js";

const { inspect } = createBrowserInspector();

export default function Steps() {
	const [state, emitEvent, service] = useMachine(setupStateMachine, {
		inspect,
	});

	return (
		<div class="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
			<Switch fallback={<pre>{JSON.stringify(state.toJSON(), null, 2)}</pre>}>
				<Match when={(state as any).matches("Start_CheckingWebSerialSupport")}>
					<AlertInline>
						<AlertTitle>Checking Web Serial support</AlertTitle>
						<AlertDescription>
							We are verifying that your browser supports the Web Serial API.
						</AlertDescription>
					</AlertInline>
				</Match>
				<Match when={(state as any).matches("Start_FetchUpstreamVersions")}>
					<AlertInline>
						<AlertTitle>Fetching versions</AlertTitle>
						<AlertDescription>
							Getting the latest available firmware versions.
						</AlertDescription>
					</AlertInline>
				</Match>

				<Match when={(state as any).matches("Start_WaitingForUser")}>
					<div class="space-y-4">
						<AlertInline>
							<AlertTitle>Waiting for your confirmation</AlertTitle>
							<AlertDescription>Please confirm to continue.</AlertDescription>
						</AlertInline>
						<div class="pt-1">
							<Button onClick={() => emitEvent({ type: "start.next" })}>
								Next
							</Button>
						</div>
					</div>
				</Match>

				<Match when={(state as any).matches("Connect_Connecting")}>
					<AlertInline>
						<AlertTitle>Connecting</AlertTitle>
						<AlertDescription>
							Trying to connect to your device.
						</AlertDescription>
					</AlertInline>
				</Match>
				<Match when={(state as any).matches("Connect_ReadingVersion")}>
					<AlertInline>
						<AlertTitle>Reading firmware version</AlertTitle>
						<AlertDescription>Gathering device information.</AlertDescription>
					</AlertInline>
				</Match>

				<Match
					when={(state as any).matches(
						"Install_WaitingForInstallationMethodChoice"
					)}
				>
					<div class="space-y-4">
						<AlertInline>
							<AlertTitle>Choose installation method</AlertTitle>
							<AlertDescription>
								Install fresh or update existing firmware.
							</AlertDescription>
						</AlertInline>
						<div class="flex gap-3">
							<Button
								disabled={!state.can({ type: "install.install" })}
								onClick={() => emitEvent({ type: "install.install" })}
							>
								Install
							</Button>
							<Button
								disabled={!state.can({ type: "install.update" })}
								onClick={() => emitEvent({ type: "install.update" })}
							>
								Update
							</Button>
						</div>

						<SelectField
							value={state.context.targetFirmwareVersion}
							options={["0.0.0", "0.0.1"]}
							placeholder="SelectField a version"
							onChange={(version) =>
								emitEvent({
									type: "install.target_version_selected",
									version: version,
								})
							}
							itemComponent={(props) => (
								<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
							)}
						>
							<SelectTrigger class="w-[180px]">
								<SelectValue<string>>
									{(state) => state.selectedOption()}
								</SelectValue>
							</SelectTrigger>
							<SelectContent />
						</SelectField>
					</div>
				</Match>

				<Match when={(state as any).matches("Install_Installing")}>
					<AlertInline>
						<AlertTitle>Installing</AlertTitle>
						<AlertDescription>
							Flashing firmware to the device.
						</AlertDescription>
					</AlertInline>
				</Match>

				<Match when={(state as any).matches("Install_Updating")}>
					<AlertInline>
						<AlertTitle>Updating</AlertTitle>
						<AlertDescription>Updating the existing firmware.</AlertDescription>
					</AlertInline>
				</Match>
				<Match when={(state as any).matches("Install_MigratingConfiguration")}>
					<AlertInline>
						<AlertTitle>Migrating configuration</AlertTitle>
						<AlertDescription>Keeping your settings safe.</AlertDescription>
					</AlertInline>
				</Match>

				<Match when={(state as any).matches("Config_LoadingConfiguration")}>
					<AlertInline>
						<AlertTitle>Loading configuration</AlertTitle>
						<AlertDescription>
							Reading the current device settings.
						</AlertDescription>
					</AlertInline>
				</Match>

				<Match when={(state as any).matches("Config_Editing")}>
					<div class="space-y-3">
						<TextFieldRoot>
							<TextFieldLabel>appEUI</TextFieldLabel>
						<TextFieldInput
								type="text"
								name="appEUI"
							onChange={(t: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) =>
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
								type="text"
								name="appKey"
							onChange={(t: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) =>
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
								type="text"
								name="devEUI"
							onChange={(t: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) =>
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
											firmwareVersion: "",
											configVersion: "",
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
				</Match>
				<Match when={(state as any).matches("Config_WritingConfiguration")}>
					<span>Writing configuration...</span>
				</Match>

				<Match when={(state as any).matches("Finish_ShowingNextSteps")}>
					<AlertInline>
						<AlertTitle>Next steps</AlertTitle>
						<AlertDescription>
							All set. You can now use your device.
						</AlertDescription>
					</AlertInline>
				</Match>
				<Match when={(state as any).matches("Finish_ShowingError")}>
					<div class="space-y-3">
						<AlertInline variant="destructive">
							<AlertTitle>Critical error</AlertTitle>
							<AlertDescription>
								{(state.context.error as unknown as Error).toString()}
								{(state.context.error as unknown as Error).stack}
								{(state.context.error as unknown as Error).cause!}
							</AlertDescription>
						</AlertInline>
						<div class="pt-1">
							<Button onClick={() => emitEvent({ type: "restart" })}>
								Restart
							</Button>
						</div>
					</div>
				</Match>
			</Switch>
		</div>
	);
}
