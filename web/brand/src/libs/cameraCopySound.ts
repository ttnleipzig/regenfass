import { isSoundEnabled } from "./soundPreference.ts";

/** Camera shutter sample (served from `public/audio/`). */
const PHOTO_SOUND_URL = "/audio/photo.mp3";

let photoAudio: HTMLAudioElement | null = null;

function getPhotoAudio(): HTMLAudioElement {
	if (!photoAudio) {
		photoAudio = new Audio(PHOTO_SOUND_URL);
		photoAudio.preload = "auto";
	}
	return photoAudio;
}

/** Vintage camera shutter when copy succeeds. */
export function playCameraCopySound(): void {
	if (!isSoundEnabled()) return;
	try {
		const audio = getPhotoAudio();
		audio.currentTime = 0;
		void audio.play();
	} catch {
		/* autoplay blocked or missing audio */
	}
}

/** @internal Reset cached audio element between tests. */
export function resetCameraCopySoundForTests(): void {
	photoAudio = null;
}
