let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
	try {
		if (audioContext) return audioContext;
		const AC =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (!AC) return null;
		audioContext = new AC();
		return audioContext;
	} catch {
		return null;
	}
}

export function resumeAudioContext(): void {
	const ctx = getAudioContext();
	if (ctx) void ctx.resume();
}

/** @internal Reset shared context between tests. */
export function resetWebAudioContextForTests(): void {
	audioContext = null;
}
