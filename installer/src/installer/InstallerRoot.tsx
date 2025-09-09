import { setupStateMachine } from "@/libs/install/state";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/solid";
import { Component, createEffect, createSignal } from "solid-js";
import {
	getFormComponent,
	getStateDisplayName,
	hasCustomForm,
} from "./stateToFormMap";
import type { InstallerContext, InstallerStateNames } from "./types";

export interface InstallerRootProps {
	class?: string;
}

const { inspect } = createBrowserInspector();

const InstallerRoot: Component<InstallerRootProps> = (props) => {
	const [state, send, service] = useMachine(setupStateMachine, { inspect });
	const [currentStateName, setCurrentStateName] =
		createSignal<InstallerStateNames>("Start_CheckingWebSerialSupport");

	// Update current state name when state changes
	createEffect(() => {
		const stateValue = state.value;
		if (typeof stateValue === "string") {
			setCurrentStateName(stateValue as InstallerStateNames);
		} else if (typeof stateValue === "object") {
			// Handle nested states
			const stateKeys = Object.keys(stateValue);
			if (stateKeys.length > 0) {
				setCurrentStateName(stateKeys[0] as InstallerStateNames);
			}
		}
	});

	// Handle form events
	const handleFormEvent = (event: any) => {
		send(event);
	};

	// Handle navigation
	const handleNext = () => {
		// This will be handled by individual form components
	};

	const handleBack = () => {
		// This will be handled by individual form components
	};

	// Get current form component
	const CurrentFormComponent = () => {
		const FormComponent = getFormComponent(currentStateName());
		return FormComponent;
	};

	// Get progress information
	const getProgressInfo = () => {
		const allStates: InstallerStateNames[] = [
			"Start_CheckingWebSerialSupport",
			"Start_FetchUpstreamVersions",
			"Start_WaitingForUser",
			"Connect_Connecting",
			"Connect_ReadingVersion",
			"Install_WaitingForInstallationMethodChoice",
			"Install_Installing",
			"Install_Updating",
			"Install_MigratingConfiguration",
			"Config_LoadingConfiguration",
			"Config_Editing",
			"Config_WritingConfiguration",
			"Finish_ShowingNextSteps",
			"Finish_ShowingError",
		];

		const currentIndex = allStates.indexOf(currentStateName());
		const progress = Math.max(
			0,
			Math.min(100, (currentIndex / (allStates.length - 1)) * 100)
		);

		return {
			current: currentIndex + 1,
			total: allStates.length,
			progress,
			isComplete: currentStateName() === "Finish_ShowingNextSteps",
			hasError: currentStateName() === "Finish_ShowingError",
		};
	};

	const progressInfo = getProgressInfo();

	return (
		<div class={`max-w-4xl mx-auto p-6 ${props.class || ""}`}>
			{/* Progress Bar */}
			<div class="mb-8">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-gray-700">
						Schritt {progressInfo.current} von {progressInfo.total}
					</span>
					<span class="text-sm text-gray-500">
						{Math.round(progressInfo.progress)}%
					</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-2">
					<div
						class={`h-2 rounded-full transition-all duration-300 ${
							progressInfo.hasError
								? "bg-red-500"
								: progressInfo.isComplete
								? "bg-green-500"
								: "bg-blue-500"
						}`}
						style={{ width: `${progressInfo.progress}%` }}
					></div>
				</div>
				<div class="mt-2">
					<h2 class="text-lg font-semibold text-gray-900">
						{getStateDisplayName(currentStateName())}
					</h2>
				</div>
			</div>

			{/* Main Content */}
			<div class="bg-white rounded-lg shadow-lg p-6">
				<CurrentFormComponent
					state={state}
					context={state.context as InstallerContext}
					send={handleFormEvent}
					onNext={handleNext}
					onBack={handleBack}
					// Pass additional props based on state
					upstreamVersions={state.context.upstreamVersions}
					error={state.context.error}
					configuration={state.context.configuration}
					currentFirmwareVersion={state.context.firmwareVersion}
				/>
			</div>

			{/* Debug Information (only in development) */}
			{import.meta.env.DEV && (
				<div class="mt-8 p-4 bg-gray-100 rounded-lg">
					<h3 class="text-sm font-medium text-gray-900 mb-2">Debug Info</h3>
					<div class="text-xs text-gray-600 space-y-1">
						<div>
							<strong>Current State:</strong> {currentStateName()}
						</div>
						<div>
							<strong>Has Custom Form:</strong>{" "}
							{hasCustomForm(currentStateName()) ? "Yes" : "No"}
						</div>
						<div>
							<strong>Progress:</strong> {progressInfo.progress.toFixed(1)}%
						</div>
						<div>
							<strong>Error:</strong>{" "}
							{state.context.error ? state.context.error.toString() : "None"}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export { InstallerRoot };
