import { setupStateMachine } from "@/libs/install/state.ts";
import { trackEvent } from "@regenfass/brand";
import { createBrowserInspector } from "@statelyai/inspect";
import { fromActorRef, useActorRef } from "@xstate/solid";
import { createEffect, Match, Switch } from "solid-js";
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

const inspect = import.meta.env.DEV
	? createBrowserInspector().inspect
	: undefined;

function stateNameFromValue(value: unknown): string | undefined {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") {
		const keys = Object.keys(value as Record<string, unknown>);
		return keys[0];
	}
	return undefined;
}

export default function Steps() {
	// useMachine’s first tuple value is a one-shot snapshot in @xstate/solid 2.0.0 (it calls
	// `fromActorRef(actorRef)()`), so Switch/Match would never see transitions. Use the actor
	// ref + `fromActorRef` accessor so `snapshot()` stays in sync with the running machine.
	const actorRef = useActorRef(setupStateMachine, {
		...(inspect ? { inspect } : {}),
	});
	const snapshot = fromActorRef(actorRef);
	const send = actorRef.send;

	let lastTrackedState: string | undefined;
	createEffect(() => {
		const name = stateNameFromValue(snapshot().value);
		if (!name || name === lastTrackedState) return;
		lastTrackedState = name;
		trackEvent(`installer_state_${name}`);
	});

	return (
		<div class="site-container py-6 space-y-6">
			<Switch fallback={<pre>{JSON.stringify(snapshot().toJSON(), null, 2)}</pre>}>
				<Match when={snapshot().matches("Start_CheckingWebSerialSupport")}>
					<StepStartCheckingWebSerialSupport state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Start_FetchUpstreamVersions")}>
					<StepStartFetchUpstreamVersions state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Start_WaitingForUser")}>
					<StepStartWaitingForUser state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Connect_Connecting")}>
					<StepConnectConnecting state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Connect_ReadingVersion")}>
					<StepConnectReadingVersion state={snapshot()} emitEvent={send} />
				</Match>
				<Match
					when={snapshot().matches("Install_WaitingForInstallationMethodChoice")}
				>
					<StepInstallWaitingForInstallationMethodChoice
						state={snapshot()}
						emitEvent={send}
					/>
				</Match>
				<Match when={snapshot().matches("Install_Installing")}>
					<StepInstallInstalling state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Install_MigratingConfiguration")}>
					<StepInstallMigratingConfiguration state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Config_Editing")}>
					<StepConfigEditing state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Config_WritingConfiguration")}>
					<StepConfigWritingConfiguration state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Finish_ShowingNextSteps")}>
					<StepFinishShowingNextSteps state={snapshot()} emitEvent={send} />
				</Match>
				<Match when={snapshot().matches("Finish_ShowingError")}>
					<StepFinishShowingError state={snapshot()} emitEvent={send} />
				</Match>
			</Switch>
		</div>
	);
}
