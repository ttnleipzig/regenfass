import { Button } from "@/components/ui/button.tsx";
import { setupStateMachine } from "@/libs/install/state.ts";
import { useMachine } from "@xstate/solid";
import { Match, Switch } from "solid-js";

export default function Steps() {
	const [state, emitEvent, machineRef] = useMachine(setupStateMachine);

	return (
		<div>
			<Switch fallback={<pre>{JSON.stringify(state.toJSON(), null, 2)}</pre>}>
				<Match when={state.matches("Start_CheckingWebSerialSupport")}>
					Checking web serial support...
				</Match>
				<Match when={state.matches("Start_FetchUpstreamVersions")}>
					Fetching upstream versions...
				</Match>

				<Match when={state.matches("Start_WaitingForUser")}>
					<div>
						<span>Waiting for your confirmation</span>
						<Button onClick={() => emitEvent({ type: "start.next" })}>
							Next
						</Button>
					</div>
				</Match>

				<Match when={state.matches("Connect_Connecting")}>Connecting...</Match>
				<Match when={state.matches("Connect_ReadingVersion")}>
					Reading version...
				</Match>

				<Match
					when={state.matches("Install_WaitingForInstallationMethodChoice")}
				>
					<div>
						<span>Do you wanna update?</span>
						<Button onClick={() => emitEvent({ type: "install.install" })}>
							Install
						</Button>
						<Button onClick={() => emitEvent({ type: "install.update" })}>
							Update
						</Button>
					</div>
				</Match>

				<Match when={state.matches("Install_Installing")}>
					<span>Installing...</span>
				</Match>

				<Match when={state.matches("Install_Updating")}>
					<span>Updating...</span>
				</Match>
				<Match when={state.matches("Install_MigratingConfiguration")}>
					<span>Migrating configuration...</span>
				</Match>

				<Match when={state.matches("Config_LoadingConfiguration")}>
					<span>Loading configuration...</span>
				</Match>

				<Match when={state.matches("Config_Editing")}>
					<div>
						<input
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
						<input
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
						<input
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
						<Button onclick={() => emitEvent({ type: "config.clear" })}>
							clear
						</Button>
						<Button
							onclick={() =>
								emitEvent({ type: "config.loadFromFile", config: {} })
							}
						>
							load from file
						</Button>
						<Button onclick={() => emitEvent({ type: "config.saveToFile" })}>
							save to file
						</Button>
						<Button onclick={() => emitEvent({ type: "config.next" })}>
							next
						</Button>
					</div>
				</Match>
				<Match when={state.matches("Config_WritingConfiguration")}>
					<span>Writing configuration...</span>
				</Match>

				<Match when={state.matches("Finish_ShowingNextSteps")}>
					<span>Next steps:</span>
				</Match>
				<Match when={state.matches("Finish_ShowingError")}>
					<span>
						Error: {(state.context.error as unknown as Error).toString()}
					</span>
				</Match>
			</Switch>
		</div>
	);
}
