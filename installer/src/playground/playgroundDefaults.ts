const noop = () => {};

const mockXStateShell = {
	matches: (_id: string) => false,
	can: (_event?: unknown) => true,
	context: {} as Record<string, unknown>,
};

function stepState(
	overrides: Record<string, unknown>,
): { state: typeof mockXStateShell; emitEvent: () => void } {
	return {
		state: { ...mockXStateShell, ...overrides },
		emitEvent: noop,
	};
}

/** Extra props merged into the playground preview so components render without installer context. */
export function getPlaygroundExtraProps(componentName: string): Record<string, unknown> {
	const out: Record<string, unknown> = {};

	if (componentName === "StepPaginator") {
		out.steps = ["Download", "Install", "Configure"];
		out.title = "Installation";
		out.activeStep = 2;
		out.listAriaLabel = "Installation steps";
		return out;
	}

	if (componentName === "Link") {
		out.href = "#playground-preview";
		out.children = "Example link";
		return out;
	}

	if (componentName === "Select") {
		out.options = ["Preview A", "Preview B"];
		out.value = "Preview A";
		out.label = "Example";
		return out;
	}

	const stepMocks: Record<string, Record<string, unknown>> = {
		StepConfigEditing: stepState({
			context: {
				deviceInfo: {
					config: {
						appEUI: "0".repeat(16),
						devEUI: "0".repeat(16),
						appKey: "",
					},
				},
			},
		}),
		StepFinishShowingError: stepState({
			context: { error: new Error("Preview-only error") },
		}),
		StepInstallWaitingForInstallationMethodChoice: stepState({
			matches: (id: string) => id === "Install_WaitingForInstallationMethodChoice",
			context: {
				targetFirmwareVersion: "v1.0.0",
				upstreamVersions: ["v1.0.0", "v2.0.0"],
			},
		}),
	};

	if (stepMocks[componentName]) {
		return stepMocks[componentName];
	}

	if (
		componentName.startsWith("Step") &&
		componentName !== "Steps" &&
		componentName !== "StepPaginator"
	) {
		return stepState({});
	}

	return out;
}

/** Fill missing or empty prop values from playground extras (registry metadata often omits required runtime props). */
export function mergePlaygroundExtras(
	componentName: string,
	props: Record<string, unknown>,
): void {
	const extra = getPlaygroundExtraProps(componentName);
	const isStep =
		componentName.startsWith("Step") &&
		componentName !== "Steps" &&
		componentName !== "StepPaginator";

	if (isStep) {
		Object.assign(props, extra);
		return;
	}

	for (const [key, value] of Object.entries(extra)) {
		const cur = props[key];
		if (cur === undefined || cur === "") {
			props[key] = value;
		}
	}
}
