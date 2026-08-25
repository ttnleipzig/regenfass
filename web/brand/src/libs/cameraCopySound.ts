import { isSoundEnabled } from "./soundPreference.ts";
import { getAudioContext, resumeAudioContext } from "./webAudioContext.ts";

/** Short synthesized camera shutter when copy succeeds. */
export function playCameraCopySound(): void {
	if (!isSoundEnabled()) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		resumeAudioContext();

		const start = ctx.currentTime;
		const master = ctx.createGain();
		master.gain.setValueAtTime(0.0001, start);
		master.gain.exponentialRampToValueAtTime(0.32, start + 0.004);
		master.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
		master.connect(ctx.destination);

		const click = ctx.createOscillator();
		click.type = "square";
		click.frequency.setValueAtTime(220, start);
		click.frequency.exponentialRampToValueAtTime(72, start + 0.08);
		click.connect(master);
		click.start(start);
		click.stop(start + 0.13);

		const noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.045), ctx.sampleRate);
		const noise = noiseBuffer.getChannelData(0);
		for (let index = 0; index < noise.length; index += 1) {
			noise[index] = (Math.random() * 2 - 1) * (1 - index / noise.length);
		}
		const shutter = ctx.createBufferSource();
		shutter.buffer = noiseBuffer;
		const filter = ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.value = 1500;
		filter.Q.value = 0.7;
		shutter.connect(filter);
		filter.connect(master);
		shutter.start(start);
		shutter.stop(start + 0.05);
	} catch {
		/* no audio context (SSR, policy, …) */
	}
}

/** @internal Reset cached audio element between tests. */
export function resetCameraCopySoundForTests(): void {
	// The sound uses the shared Web Audio context and has no cached asset.
}
