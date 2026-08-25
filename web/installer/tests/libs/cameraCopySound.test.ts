import { afterEach, describe, expect, it, vi } from "vitest";
import {
	playCameraCopySound,
	resetCameraCopySoundForTests,
} from "@/libs/cameraCopySound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";
import { resetWebAudioContextForTests } from "@/libs/webAudioContext.ts";

describe("cameraCopySound", () => {
	const createFakeAudioContext = () => {
		const gain = {
			setValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn(),
		};
		const gainNode = { gain, connect: vi.fn() };
		const oscillator = {
			type: "square",
			frequency: {
				setValueAtTime: vi.fn(),
				exponentialRampToValueAtTime: vi.fn(),
			},
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
		};
		const bufferSource = {
			buffer: null as AudioBuffer | null,
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
		};
		const filter = {
			type: "bandpass",
			frequency: { value: 0 },
			Q: { value: 0 },
			connect: vi.fn(),
		};
		const ctx = {
			currentTime: 0,
			sampleRate: 48_000,
			destination: {},
			resume: vi.fn().mockResolvedValue(undefined),
			createGain: vi.fn(() => gainNode),
			createOscillator: vi.fn(() => oscillator),
			createBuffer: vi.fn((channels: number, length: number) => ({
				getChannelData: vi.fn(() => new Float32Array(length)),
			})),
			createBufferSource: vi.fn(() => bufferSource),
			createBiquadFilter: vi.fn(() => filter),
		};
		return ctx;
	};

	afterEach(() => {
		resetCameraCopySoundForTests();
		resetWebAudioContextForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
	});

	it("creates and uses an audio context when enabled", () => {
		setSoundEnabled(true);
		const context = createFakeAudioContext();
		const AudioContextMock = vi.fn(function AudioContext() {
			return context;
		});
		vi.stubGlobal("AudioContext", AudioContextMock);

		playCameraCopySound();

		expect(AudioContextMock).toHaveBeenCalledTimes(1);
		expect(context.resume).toHaveBeenCalledTimes(1);
		expect(context.createGain).toHaveBeenCalledTimes(1);
		expect(context.createOscillator).toHaveBeenCalledTimes(1);
		expect(context.createBuffer).toHaveBeenCalledTimes(1);
		expect(context.createBufferSource).toHaveBeenCalledTimes(1);
		expect(context.createBiquadFilter).toHaveBeenCalledTimes(1);
	});

	it("reuses the same audio context on repeat play", () => {
		setSoundEnabled(true);
		const context = createFakeAudioContext();
		const AudioContextMock = vi.fn(function AudioContext() {
			return context;
		});
		vi.stubGlobal("AudioContext", AudioContextMock);

		playCameraCopySound();
		playCameraCopySound();

		expect(AudioContextMock).toHaveBeenCalledTimes(1);
		expect(context.resume).toHaveBeenCalledTimes(2);
	});

	it("does not play when sounds are muted", () => {
		const context = createFakeAudioContext();
		const AudioContextMock = vi.fn(function AudioContext() {
			return context;
		});
		vi.stubGlobal("AudioContext", AudioContextMock);
		setSoundEnabled(false);

		playCameraCopySound();

		expect(AudioContextMock).not.toHaveBeenCalled();
		expect(context.resume).not.toHaveBeenCalled();
	});

	it("does not throw when AudioContext is unavailable", () => {
		vi.stubGlobal("AudioContext", undefined);

		expect(() => playCameraCopySound()).not.toThrow();
	});
});
