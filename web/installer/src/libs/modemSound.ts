import { isSoundEnabled } from "@/libs/soundPreference.ts";

/** Dial-up modem sample (served from `public/audio/`). */
const MODEM_SOUND_URL = "/audio/modem.mp3";

let modemAudio: HTMLAudioElement | null = null;

function getModemAudio(): HTMLAudioElement {
	if (!modemAudio) {
		modemAudio = new Audio(MODEM_SOUND_URL);
		modemAudio.preload = "auto";
	}
	return modemAudio;
}

/** Loop modem audio while a progress bar step is active (flash / config write). */
export function startModemSound(): void {
	if (!isSoundEnabled()) return;
	try {
		const audio = getModemAudio();
		if (!audio.paused && audio.loop) return;
		audio.loop = true;
		audio.currentTime = 0;
		void audio.play();
	} catch {
		/* autoplay blocked or missing audio */
	}
}

/** Stop modem audio when leaving a progress bar step. */
export function stopModemSound(): void {
	if (!modemAudio) return;
	try {
		modemAudio.pause();
		modemAudio.currentTime = 0;
		modemAudio.loop = false;
	} catch {
		/* missing audio */
	}
}

/** @internal Reset cached audio element between tests. */
export function resetModemSoundForTests(): void {
	stopModemSound();
	modemAudio = null;
}
