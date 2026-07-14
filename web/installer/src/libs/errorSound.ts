import { isSoundEnabled } from "@/libs/soundPreference.ts";

/** Error alert sample (served from `public/audio/`). */
const ERROR_SOUND_URL = "/audio/error.mp3";

let errorAudio: HTMLAudioElement | null = null;

function getErrorAudio(): HTMLAudioElement {
	if (!errorAudio) {
		errorAudio = new Audio(ERROR_SOUND_URL);
		errorAudio.preload = "auto";
	}
	return errorAudio;
}

/** Plays when an error message is shown to the user. */
export function playErrorSound(): void {
	if (!isSoundEnabled()) return;
	try {
		const audio = getErrorAudio();
		audio.currentTime = 0;
		void audio.play();
	} catch {
		/* autoplay blocked or missing audio */
	}
}

/** @internal Reset cached audio element between tests. */
export function resetErrorSoundForTests(): void {
	errorAudio = null;
}
