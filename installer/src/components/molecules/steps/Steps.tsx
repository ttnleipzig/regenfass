import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button.tsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx";
import {
	TextFieldRoot,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/textfield.tsx";
import { setupStateMachine } from "@/libs/install/state.ts";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/solid";
import { Match, Switch } from "solid-js";

const { inspect } = createBrowserInspector();

export default function Steps() {
	const [state, emitEvent, machineRef] = useMachine(setupStateMachine, {
		inspect,
	});

	return (
		<div class="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
			<Switch fallback={<pre>{JSON.stringify(state.toJSON(), null, 2)}</pre>}>
				<Match when={(state as any).matches("Start_CheckingWebSerialSupport")}>
					<Alert>
						<AlertTitle>Checking Web Serial support</AlertTitle>
						<AlertDescription>
							We are verifying that your browser supports the Web Serial API.
						</AlertDescription>
					</Alert>
				</Match>
				<Match when={(state as any).matches("Start_FetchUpstreamVersions")}>
					<Alert>
						<AlertTitle>Fetching versions</AlertTitle>
						<AlertDescription>
							Getting the latest available firmware versions.
						</AlertDescription>
					</Alert>
				</Match>

				<Match when={(state as any).matches("Start_WaitingForUser")}>
					<div class="space-y-4">
						<Alert>
							<AlertTitle>Waiting for your confirmation</AlertTitle>
							<AlertDescription>Please confirm to continue.</AlertDescription>
						</Alert>
						<div class="pt-1">
							<Button onClick={() => emitEvent({ type: "start.next" })}>
								Next
							</Button>
						</div>
					</div>
				</Match>

				<Match when={(state as any).matches("Connect_Connecting")}>
					<Alert>
						<AlertTitle>Connecting</AlertTitle>
						<AlertDescription>
							Trying to connect to your device.
						</AlertDescription>
					</Alert>
				</Match>
				<Match when={(state as any).matches("Connect_ReadingVersion")}>
					<Alert>
						<AlertTitle>Reading firmware version</AlertTitle>
						<AlertDescription>Gathering device information.</AlertDescription>
					</Alert>
				</Match>

				<Match
					when={(state as any).matches(
						"Install_WaitingForInstallationMethodChoice"
					)}
				>
					<div class="space-y-4">
						<Alert>
							<AlertTitle>Choose installation method</AlertTitle>
							<AlertDescription>
								Install fresh or update existing firmware.
							</AlertDescription>
						</Alert>
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

						<Select
							value={state.context.targetFirmwareVersion}
							options={["0.0.0", "0.0.1"]}
							placeholder="Select a version"
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
						</Select>
					</div>
				</Match>

				<Match when={(state as any).matches("Install_Installing")}>
					<Alert>
						<AlertTitle>Installing</AlertTitle>
						<AlertDescription>
							Flashing firmware to the device.
						</AlertDescription>
					</Alert>
				</Match>

				<Match when={(state as any).matches("Install_Updating")}>
					<Alert>
						<AlertTitle>Updating</AlertTitle>
						<AlertDescription>Updating the existing firmware.</AlertDescription>
					</Alert>
				</Match>
				<Match when={(state as any).matches("Install_MigratingConfiguration")}>
					<Alert>
						<AlertTitle>Migrating configuration</AlertTitle>
						<AlertDescription>Keeping your settings safe.</AlertDescription>
					</Alert>
				</Match>

				<Match when={(state as any).matches("Config_LoadingConfiguration")}>
					<Alert>
						<AlertTitle>Loading configuration</AlertTitle>
						<AlertDescription>
							Reading the current device settings.
						</AlertDescription>
					</Alert>
				</Match>

				<Match when={(state as any).matches("Config_Editing")}>
					<div class="space-y-3">
						<TextFieldRoot>
							<TextFieldLabel>appEUI</TextFieldLabel>
							<TextFieldInput
								type="text"
								name="appEUI"
								onChange={(t) =>
									emitEvent({
										type: "config.changeField",
										field: "appEUI",
										value: t.target.value,
									})
								}
							/>
						</TextFieldRoot>
						<TextFieldRoot>
							<TextFieldLabel>appKey</TextFieldLabel>
							<TextFieldInput
								type="text"
								name="appKey"
								onChange={(t) =>
									emitEvent({
										type: "config.changeField",
										field: "appKey",
										value: t.target.value,
									})
								}
							/>
						</TextFieldRoot>
						<TextFieldRoot>
							<TextFieldLabel>devEUI</TextFieldLabel>
							<TextFieldInput
								type="text"
								name="devEUI"
								onChange={(t) =>
									emitEvent({
										type: "config.changeField",
										field: "devEUI",
										value: t.target.value,
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
					<Alert>
						<AlertTitle>Next steps</AlertTitle>
						<AlertDescription>
							All set. You can now use your device.
						</AlertDescription>
					</Alert>
				</Match>
				<Match when={(state as any).matches("Finish_ShowingError")}>
					<AlertDialog>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Critical error</AlertDialogTitle>
								<AlertDialogDescription>
									{(state.context.error as unknown as Error).toString()}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogAction>OK</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</Match>
			</Switch>
		</div>
	);
}
