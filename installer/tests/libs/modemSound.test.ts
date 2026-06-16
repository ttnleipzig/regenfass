import { afterEach, describe, expect, it, vi } from "vitest";
import {
	resetModemSoundForTests,
	startModemSound,
	stopModemSound,
} from "@/libs/modemSound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";

describe("modemSound", () => {
	const playMock = vi.fn().mockResolvedValue(undefined);
	const pauseMock = vi.fn();

	function createAudioElement() {
		return {
			preload: "",
			currentTime: 0,
			loop: false,
			paused: true,
			play: playMock.mockImplementation(function (this: { paused: boolean }) {
				this.paused = false;
				return Promise.resolve();
			}),
			pause: pauseMock.mockImplementation(function (this: { paused: boolean }) {
				this.paused = true;
			}),
		};
	}

	afterEach(() => {
		resetModemSoundForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
		playMock.mockClear();
		pauseMock.mockClear();
	});

	it("starts looping modem.mp3", () => {
		setSoundEnabled(true);
		const AudioMock = vi.fn(createAudioElement);
		vi.stubGlobal("Audio", AudioMock);

		startModemSound();

		expect(AudioMock).toHaveBeenCalledWith("/audio/modem.mp3");
		const audio = AudioMock.mock.results[0]?.value;
		expect(audio.loop).toBe(true);
		expect(playMock).toHaveBeenCalledTimes(1);
	});

	it("reuses the same audio element on repeat start while playing", () => {
		setSoundEnabled(true);
		const AudioMock = vi.fn(createAudioElement);
		vi.stubGlobal("Audio", AudioMock);

		startModemSound();
		startModemSound();

		expect(AudioMock).toHaveBeenCalledTimes(1);
		expect(playMock).toHaveBeenCalledTimes(1);
	});

	it("stopModemSound pauses and clears loop", () => {
		setSoundEnabled(true);
		const AudioMock = vi.fn(createAudioElement);
		vi.stubGlobal("Audio", AudioMock);

		startModemSound();
		const audio = AudioMock.mock.results[0]?.value;
		stopModemSound();

		expect(pauseMock).toHaveBeenCalledTimes(1);
		expect(audio.currentTime).toBe(0);
		expect(audio.loop).toBe(false);
	});

	it("does not start when sounds are muted", () => {
		const AudioMock = vi.fn(createAudioElement);
		vi.stubGlobal("Audio", AudioMock);
		setSoundEnabled(false);

		startModemSound();

		expect(AudioMock).not.toHaveBeenCalled();
		expect(playMock).not.toHaveBeenCalled();
	});

	it("does not throw when Audio is unavailable", () => {
		vi.stubGlobal("Audio", undefined);

		expect(() => startModemSound()).not.toThrow();
		expect(() => stopModemSound()).not.toThrow();
	});
});
