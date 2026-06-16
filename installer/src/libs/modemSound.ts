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

/** Classic modem handshake after flash or serial config I/O completes. */
export function playModemSound(): void {
	if (!isSoundEnabled()) return;
	try {
		const audio = getModemAudio();
		audio.currentTime = 0;
		void audio.play();
	} catch {
		/* autoplay blocked or missing audio */
	}
}

/** @internal Reset cached audio element between tests. */
export function resetModemSoundForTests(): void {
	modemAudio = null;
}
