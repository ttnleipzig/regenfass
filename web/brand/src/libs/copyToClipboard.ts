import { playCameraCopySound } from "./cameraCopySound.ts";

/** Copy text to the system clipboard and play the camera shutter on success. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		playCameraCopySound();
		return true;
	} catch {
		return false;
	}
}
