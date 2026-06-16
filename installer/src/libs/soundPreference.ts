import { createRoot, createSignal } from "solid-js";

const STORAGE_KEY = "regenfass-sound-enabled";

function readStored(): boolean {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) return true;
		return raw === "true";
	} catch {
		return true;
	}
}

function persist(enabled: boolean): void {
	try {
		localStorage.setItem(STORAGE_KEY, String(enabled));
	} catch {
		/* restrictive environments */
	}
}

const [soundEnabled, setSoundEnabledSignal] = createRoot(() =>
	createSignal(readStored()),
);

export { soundEnabled };

export function isSoundEnabled(): boolean {
	return soundEnabled();
}

export function setSoundEnabled(enabled: boolean): void {
	setSoundEnabledSignal(enabled);
	persist(enabled);
}

export function toggleSoundEnabled(): boolean {
	const next = !soundEnabled();
	setSoundEnabled(next);
	return next;
}

/** @internal Reset preference between tests. */
export function resetSoundPreferenceForTests(): void {
	setSoundEnabledSignal(true);
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		/* ignore */
	}
}
