import { afterEach, describe, expect, it, vi } from "vitest";
import {
	playCameraCopySound,
	resetCameraCopySoundForTests,
} from "@/libs/cameraCopySound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";

describe("cameraCopySound", () => {
	const playMock = vi.fn().mockResolvedValue(undefined);

	afterEach(() => {
		resetCameraCopySoundForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
		playMock.mockClear();
	});

	it("plays the photo.mp3 sample", () => {
		setSoundEnabled(true);
		const AudioMock = vi.fn(() => ({
			preload: "",
			currentTime: 0,
			play: playMock,
		}));
		vi.stubGlobal("Audio", AudioMock);

		playCameraCopySound();

		expect(AudioMock).toHaveBeenCalledWith("/audio/photo.mp3");
		expect(playMock).toHaveBeenCalledTimes(1);
	});

	it("reuses the same audio element on repeat play", () => {
		setSoundEnabled(true);
		const AudioMock = vi.fn(() => ({
			preload: "",
			currentTime: 0,
			play: playMock,
		}));
		vi.stubGlobal("Audio", AudioMock);

		playCameraCopySound();
		playCameraCopySound();

		expect(AudioMock).toHaveBeenCalledTimes(1);
		expect(playMock).toHaveBeenCalledTimes(2);
	});

	it("does not play when sounds are muted", () => {
		const AudioMock = vi.fn(() => ({
			preload: "",
			currentTime: 0,
			play: playMock,
		}));
		vi.stubGlobal("Audio", AudioMock);
		setSoundEnabled(false);

		playCameraCopySound();

		expect(AudioMock).not.toHaveBeenCalled();
		expect(playMock).not.toHaveBeenCalled();
	});

	it("does not throw when Audio is unavailable", () => {
		vi.stubGlobal("Audio", undefined);

		expect(() => playCameraCopySound()).not.toThrow();
	});
});
