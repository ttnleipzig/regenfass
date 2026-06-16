import { isSoundEnabled } from "@/libs/soundPreference.ts";

/** High boxing-bell strike (fixed pitch). */
const BING_FREQ_HZ = 1568;

/** Inharmonic bell partials for a metallic bing. */
const BING_PARTIALS = [
	{ ratio: 1, gain: 1 },
	{ ratio: 2.76, gain: 0.38 },
	{ ratio: 5.1, gain: 0.14 },
] as const;

const BING_ATTACK_S = 0.003;
const BING_DECAY_S = 0.52;
const BING_PEAK_GAIN = 0.11;
const FINISH_BING_COUNT = 5;
const FINISH_BING_INTERVAL_S = 0.22;

let audioContext: AudioContext | null = null;
let reverbDelay: DelayNode | null = null;
let reverbFeedback: GainNode | null = null;
let reverbWet: GainNode | null = null;
let reverbDry: GainNode | null = null;

function getAudioContext(): AudioContext | null {
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

function getReverbChain(ctx: AudioContext): {
	dry: GainNode;
	wet: GainNode;
	input: GainNode;
} {
	if (!reverbDry || !reverbWet || !reverbDelay || !reverbFeedback) {
		reverbDry = ctx.createGain();
		reverbDry.gain.value = 0.68;
		reverbWet = ctx.createGain();
		reverbWet.gain.value = 0.42;
		reverbDelay = ctx.createDelay(2);
		reverbDelay.delayTime.value = 0.11;
		reverbFeedback = ctx.createGain();
		reverbFeedback.gain.value = 0.4;
		reverbWet.connect(reverbDelay);
		reverbDelay.connect(reverbFeedback);
		reverbFeedback.connect(reverbDelay);
		reverbDelay.connect(ctx.destination);
		reverbDry.connect(ctx.destination);
	}
	const input = ctx.createGain();
	input.connect(reverbDry);
	input.connect(reverbWet);
	return { dry: reverbDry, wet: reverbWet, input };
}

function scheduleBing(ctx: AudioContext, startTime: number): void {
	const { input } = getReverbChain(ctx);

	for (const partial of BING_PARTIALS) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		const freq = BING_FREQ_HZ * partial.ratio;
		osc.frequency.setValueAtTime(freq * 1.015, startTime);
		osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.05);
		const peak = BING_PEAK_GAIN * partial.gain;
		gain.gain.setValueAtTime(0.0001, startTime);
		gain.gain.exponentialRampToValueAtTime(peak, startTime + BING_ATTACK_S);
		gain.gain.exponentialRampToValueAtTime(0.0001, startTime + BING_DECAY_S);
		osc.connect(gain);
		gain.connect(input);
		osc.start(startTime);
		osc.stop(startTime + BING_DECAY_S + 0.08);
	}
}

/** Prime audio on user gesture so later reel dings are not blocked by autoplay policy. */
export function warmUpSlotAudio(): void {
	if (!isSoundEnabled()) return;
	const ctx = getAudioContext();
	if (ctx) void ctx.resume();
}

/** Five high boxing-bell bings with reverb near the end of the reveal animation. */
export function playSlotRevealFinishSound(): void {
	if (!isSoundEnabled()) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		void ctx.resume();
		const t0 = ctx.currentTime;
		for (let i = 0; i < FINISH_BING_COUNT; i++) {
			scheduleBing(ctx, t0 + i * FINISH_BING_INTERVAL_S);
		}
	} catch {
		/* no audio context (SSR, policy, …) */
	}
}

/** @internal Reset shared context between tests. */
export function resetSlotAudioForTests(): void {
	audioContext = null;
	reverbDelay = null;
	reverbFeedback = null;
	reverbWet = null;
	reverbDry = null;
}
