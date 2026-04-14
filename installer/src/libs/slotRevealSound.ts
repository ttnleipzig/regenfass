/** Short “win” chime when the slot reveal finishes (Web Audio API). */
export function playSlotRevealSound(): void {
	try {
		const AC =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (!AC) return;
		const ctx = new AC();
		void ctx.resume();
		const t0 = ctx.currentTime;
		// C major arpeggio — quick slot-machine payoff feel
		const freqs = [523.25, 659.25, 783.99, 1046.5];
		for (let i = 0; i < freqs.length; i++) {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = freqs[i]!;
			const start = t0 + i * 0.045;
			gain.gain.setValueAtTime(0, start);
			gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(start);
			osc.stop(start + 0.42);
		}
	} catch {
		/* no audio context (SSR, policy, …) */
	}
}
