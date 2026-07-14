import { afterEach, describe, expect, it, vi } from "vitest";
import {
	playErrorSound,
	resetErrorSoundForTests,
} from "@/libs/errorSound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";

describe("errorSound", () => {
	const playMock = vi.fn().mockResolvedValue(undefined);

	afterEach(() => {
		resetErrorSoundForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
		playMock.mockClear();
	});

	it("plays the error.mp3 sample", () => {
		setSoundEnabled(true);
		const AudioMock = vi.fn(() => ({
			preload: "",
			currentTime: 0,
			play: playMock,
		}));
		vi.stubGlobal("Audio", AudioMock);

		playErrorSound();

		expect(AudioMock).toHaveBeenCalledWith("/audio/error.mp3");
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

		playErrorSound();
		playErrorSound();

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

		playErrorSound();

		expect(AudioMock).not.toHaveBeenCalled();
		expect(playMock).not.toHaveBeenCalled();
	});

	it("does not throw when Audio is unavailable", () => {
		vi.stubGlobal("Audio", undefined);

		expect(() => playErrorSound()).not.toThrow();
	});
});
