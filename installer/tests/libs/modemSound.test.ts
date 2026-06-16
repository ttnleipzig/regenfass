import { afterEach, describe, expect, it, vi } from "vitest";
import {
	playModemSound,
	resetModemSoundForTests,
} from "@/libs/modemSound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";

describe("modemSound", () => {
	const playMock = vi.fn().mockResolvedValue(undefined);

	afterEach(() => {
		resetModemSoundForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
		playMock.mockClear();
	});

	it("plays the modem.mp3 sample", () => {
		const AudioMock = vi.fn(() => ({
			preload: "",
			currentTime: 0,
			play: playMock,
		}));
		vi.stubGlobal("Audio", AudioMock);

		playModemSound();

		expect(AudioMock).toHaveBeenCalledWith("/audio/modem.mp3");
		expect(playMock).toHaveBeenCalledTimes(1);
	});

	it("reuses the same audio element on repeat play", () => {
		const AudioMock = vi.fn(() => ({
			preload: "",
			currentTime: 0,
			play: playMock,
		}));
		vi.stubGlobal("Audio", AudioMock);

		playModemSound();
		playModemSound();

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

		playModemSound();

		expect(AudioMock).not.toHaveBeenCalled();
		expect(playMock).not.toHaveBeenCalled();
	});

	it("does not throw when Audio is unavailable", () => {
		vi.stubGlobal("Audio", undefined);

		expect(() => playModemSound()).not.toThrow();
	});
});
