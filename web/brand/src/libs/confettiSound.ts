import { isSoundEnabled } from "./soundPreference.ts";
import { getAudioContext } from "./webAudioContext.ts";

const TADA_NOTES = [523.25, 659.25, 783.99] as const;

/** Play a short rising celebration fanfare for a confetti burst. */
export function playConfettiTadaSound(): void {
	if (!isSoundEnabled()) return;

	try {
		const ctx = getAudioContext();
		if (!ctx) return;
		const schedule = () => {
			const start = ctx.currentTime;
			const master = ctx.createGain();
			master.gain.setValueAtTime(0.0001, start);
			master.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
			master.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
			master.connect(ctx.destination);

			TADA_NOTES.forEach((frequency, index) => {
				const noteStart = start + index * 0.12;
				const oscillator = ctx.createOscillator();
				const gain = ctx.createGain();
				oscillator.type = "triangle";
				oscillator.frequency.setValueAtTime(frequency, noteStart);
				gain.gain.setValueAtTime(0.0001, noteStart);
				gain.gain.exponentialRampToValueAtTime(0.8, noteStart + 0.015);
				gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);
				oscillator.connect(gain);
				gain.connect(master);
				oscillator.start(noteStart);
				oscillator.stop(noteStart + 0.3);
			});
		};

		if (ctx.state === "suspended") {
			void ctx.resume().then(schedule);
		} else {
			schedule();
		}
	} catch {
		/* no audio context (SSR, policy, …) */
	}
}
