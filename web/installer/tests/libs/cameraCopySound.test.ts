import { afterEach, describe, expect, it, vi } from "vitest";
import {
	playCameraCopySound,
	resetCameraCopySoundForTests,
} from "@/libs/cameraCopySound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";
import { resetWebAudioContextForTests } from "@/libs/webAudioContext.ts";

function installMockAudioContext() {
	const resume = vi.fn().mockResolvedValue(undefined);
	const createOscillator = vi.fn(() => ({
		type: "sine",
		frequency: {
			setValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn(),
		},
		connect: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
	}));
	const createGain = vi.fn(() => ({
		gain: {
			setValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn(),
		},
		connect: vi.fn(),
	}));
	const createBuffer = vi.fn(() => ({
		getChannelData: vi.fn(() => new Float32Array(32)),
	}));
	const createBufferSource = vi.fn(() => ({
		buffer: null,
		connect: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
	}));
	const createBiquadFilter = vi.fn(() => ({
		type: "lowpass",
		frequency: { value: 0 },
		Q: { value: 0 },
		connect: vi.fn(),
	}));
	const MockAudioContext = vi.fn(function () {
		return {
			currentTime: 0,
			sampleRate: 8000,
			destination: {},
			resume,
			createOscillator,
			createGain,
			createBuffer,
			createBufferSource,
			createBiquadFilter,
		};
	});

	vi.stubGlobal("AudioContext", MockAudioContext);

	return {
		MockAudioContext,
		resume,
		createOscillator,
		createGain,
		createBuffer,
		createBufferSource,
		createBiquadFilter,
	};
}

describe("cameraCopySound", () => {
	afterEach(() => {
		resetCameraCopySoundForTests();
		resetWebAudioContextForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
	});

	it("schedules the synthesized camera shutter sound", () => {
		setSoundEnabled(true);
		const {
			MockAudioContext,
			resume,
			createOscillator,
			createGain,
			createBuffer,
			createBufferSource,
			createBiquadFilter,
		} = installMockAudioContext();

		playCameraCopySound();

		expect(MockAudioContext).toHaveBeenCalledTimes(1);
		expect(resume).toHaveBeenCalledTimes(1);
		expect(createGain).toHaveBeenCalledTimes(1);
		expect(createOscillator).toHaveBeenCalledTimes(1);
		expect(createBuffer).toHaveBeenCalledTimes(1);
		expect(createBufferSource).toHaveBeenCalledTimes(1);
		expect(createBiquadFilter).toHaveBeenCalledTimes(1);
	});

	it("reuses the same AudioContext on repeat play", () => {
		setSoundEnabled(true);
		const { MockAudioContext, createOscillator } = installMockAudioContext();

		playCameraCopySound();
		playCameraCopySound();

		expect(MockAudioContext).toHaveBeenCalledTimes(1);
		expect(createOscillator).toHaveBeenCalledTimes(2);
	});

	it("does not play when sounds are muted", () => {
		const { MockAudioContext, createOscillator } = installMockAudioContext();
		setSoundEnabled(false);

		playCameraCopySound();

		expect(MockAudioContext).not.toHaveBeenCalled();
		expect(createOscillator).not.toHaveBeenCalled();
	});

	it("does not throw when Audio is unavailable", () => {
		vi.stubGlobal("Audio", undefined);

		expect(() => playCameraCopySound()).not.toThrow();
	});
});
