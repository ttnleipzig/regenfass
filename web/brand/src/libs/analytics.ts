import { init, track, trackErrors, trackViews } from "swetrix";

export type AnalyticsMeta = Record<
	string,
	string | number | boolean | null | undefined
>;

export type InitAnalyticsOptions = {
	/** When true, send events from localhost. Default: false. */
	devMode?: boolean;
	/** Force-disable tracking even when a project ID is present. */
	disabled?: boolean;
	/**
	 * Events API base URL including the `/log` path.
	 * Cloud default: `https://api.swetrix.com/log`
	 * Self-hosted CE example: `https://analytics.example.com/backend/log`
	 */
	apiURL?: string;
};

let initialized = false;

function resolveApiURL(explicit?: string): string | undefined {
	const fromOpt = explicit?.trim();
	if (fromOpt) return fromOpt;
	return undefined;
}

/**
 * Initialise Swetrix page views and error tracking for this app.
 * No-ops when `projectId` is missing/blank (safe for local/dev without credentials).
 */
export function initAnalytics(
	projectId: string | undefined,
	options: InitAnalyticsOptions = {},
): void {
	const pid = projectId?.trim();
	if (!pid || options.disabled === true) {
		initialized = false;
		return;
	}
	if (initialized) return;

	const apiURL = resolveApiURL(options.apiURL);
	init(pid, {
		devMode: options.devMode === true,
		disabled: false,
		...(apiURL ? { apiURL } : {}),
	});
	void trackViews();
	trackErrors();
	initialized = true;
}

/** Whether `initAnalytics` succeeded with a project ID in this session. */
export function isAnalyticsInitialized(): boolean {
	return initialized;
}

/**
 * Track a custom Swetrix event. Safe no-op when analytics was not initialised.
 */
export function trackEvent(ev: string, meta?: AnalyticsMeta): void {
	if (!initialized || !ev) return;
	const payload: { ev: string; meta?: AnalyticsMeta } = { ev };
	if (meta && Object.keys(meta).length > 0) {
		payload.meta = meta;
	}
	track(payload);
}

/** Reset init flag (tests only). */
export function resetAnalyticsForTests(): void {
	initialized = false;
}
