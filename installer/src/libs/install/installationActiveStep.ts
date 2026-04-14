/**
 * Maps the setup wizard’s XState node to the 1-based `activeStep` used by
 * `StepPaginator`, aligned with `INSTALLATION_STEPS` in
 * `StepStartWaitingForUser.tsx`:
 *
 * - **1** — Connect & identify: `Start_WaitingForUser`, `Connect_Connecting`, `Connect_ReadingVersion`
 * - **2** — Version + method: `Install_WaitingForInstallationMethodChoice`
 * - **3** — Flash: `Install_Installing`
 * - **undefined** — Any other state (loading, config, finish, error): no single step highlighted
 */

export type InstallationActiveStep = 1 | 2 | 3;

export function getInstallationActiveStep(
	state: unknown,
): InstallationActiveStep | undefined {
	if (
		typeof state !== "object" ||
		state === null ||
		typeof (state as { matches?: unknown }).matches !== "function"
	) {
		return undefined;
	}

	// Keep `matches` on the snapshot: XState needs `this` from the method call.
	const snapshot = state as { matches: (stateId: string) => boolean };

	if (snapshot.matches("Install_Installing")) {
		return 3;
	}
	if (snapshot.matches("Install_WaitingForInstallationMethodChoice")) {
		return 2;
	}
	if (
		snapshot.matches("Start_WaitingForUser") ||
		snapshot.matches("Connect_Connecting") ||
		snapshot.matches("Connect_ReadingVersion")
	) {
		return 1;
	}

	return undefined;
}
