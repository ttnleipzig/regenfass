import { setupStateMachine } from "@/libs/install/state.ts";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/solid";
import { Match, Switch } from "solid-js";
import StepStartCheckingWebSerialSupport from "./StepStartCheckingWebSerialSupport.tsx";
import StepStartFetchUpstreamVersions from "./StepStartFetchUpstreamVersions.tsx";
import StepStartWaitingForUser from "./StepStartWaitingForUser.tsx";
import StepConnectConnecting from "./StepConnectConnecting.tsx";
import StepConnectReadingVersion from "./StepConnectReadingVersion.tsx";
import StepInstallWaitingForInstallationMethodChoice from "./StepInstallWaitingForInstallationMethodChoice.tsx";
import StepInstallInstalling from "./StepInstallInstalling.tsx";
import StepInstallMigratingConfiguration from "./StepInstallMigratingConfiguration.tsx";
import StepConfigEditing from "./StepConfigEditing.tsx";
import StepConfigWritingConfiguration from "./StepConfigWritingConfiguration.tsx";
import StepFinishShowingNextSteps from "./StepFinishShowingNextSteps.tsx";
import StepFinishShowingError from "./StepFinishShowingError.tsx";

const { inspect } = createBrowserInspector();

export default function Steps() {
	const [state, emitEvent] = useMachine(setupStateMachine, {
		inspect,
	});

	return (
		<div class="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
			<Switch fallback={<pre>{JSON.stringify(state.toJSON(), null, 2)}</pre>}>
				<Match when={(state as any).matches("Start_CheckingWebSerialSupport")}>
					<StepStartCheckingWebSerialSupport state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Start_FetchUpstreamVersions")}>
					<StepStartFetchUpstreamVersions state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Start_WaitingForUser")}>
					<StepStartWaitingForUser state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Connect_Connecting")}>
					<StepConnectConnecting state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Connect_ReadingVersion")}>
					<StepConnectReadingVersion state={state} emitEvent={emitEvent} />
				</Match>
				<Match
					when={(state as any).matches(
						"Install_WaitingForInstallationMethodChoice"
					)}
				>
					<StepInstallWaitingForInstallationMethodChoice
						state={state}
						emitEvent={emitEvent}
					/>
				</Match>
				<Match when={(state as any).matches("Install_Installing")}>
					<StepInstallInstalling state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Install_MigratingConfiguration")}>
					<StepInstallMigratingConfiguration state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Config_Editing")}>
					<StepConfigEditing state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Config_WritingConfiguration")}>
					<StepConfigWritingConfiguration state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Finish_ShowingNextSteps")}>
					<StepFinishShowingNextSteps state={state} emitEvent={emitEvent} />
				</Match>
				<Match when={(state as any).matches("Finish_ShowingError")}>
					<StepFinishShowingError state={state} emitEvent={emitEvent} />
				</Match>
			</Switch>
		</div>
	);
}
