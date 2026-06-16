import { afterEach, describe, expect, it, vi } from "vitest";
import {
	playSlotRevealFinishSound,
	resetSlotAudioForTests,
	warmUpSlotAudio,
} from "@/libs/slotRevealSound.ts";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";
import { resetWebAudioContextForTests } from "@/libs/webAudioContext.ts";

const PARTIALS_PER_BING = 3;
const FINISH_BING_COUNT = 5;

function installMockAudioContext() {
	const resume = vi.fn().mockResolvedValue(undefined);
	const oscillators: Array<{ frequency: { value: number }; type: string; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }> = [];

	const createOscillator = vi.fn(() => {
		const frequency = {
			value: 0,
			setValueAtTime(v: number) {
				frequency.value = v;
			},
			exponentialRampToValueAtTime(v: number) {
				frequency.value = v;
			},
		};
		const osc = {
			type: "sine",
			frequency,
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
		};
		oscillators.push(osc);
		return osc;
	});

	const createGain = vi.fn(() => ({
		gain: {
			value: 1,
			setValueAtTime: vi.fn(),
			exponentialRampToValueAtTime: vi.fn(),
			linearRampToValueAtTime: vi.fn(),
		},
		connect: vi.fn(),
	}));

	const createDelay = vi.fn(() => ({
		delayTime: { value: 0 },
		connect: vi.fn(),
	}));

	const MockAudioContext = vi.fn(() => ({
		currentTime: 0,
		destination: {},
		resume,
		createOscillator,
		createGain,
		createDelay,
	}));

	vi.stubGlobal("AudioContext", MockAudioContext);

	return { MockAudioContext, resume, createOscillator, oscillators };
}

describe("slotRevealSound", () => {
	afterEach(() => {
		resetSlotAudioForTests();
		resetWebAudioContextForTests();
		resetSoundPreferenceForTests();
		vi.unstubAllGlobals();
	});

	it("warmUpSlotAudio creates a shared AudioContext once", () => {
		const { MockAudioContext, resume } = installMockAudioContext();

		warmUpSlotAudio();
		warmUpSlotAudio();

		expect(MockAudioContext).toHaveBeenCalledTimes(1);
		expect(resume).toHaveBeenCalled();
	});

	it("playSlotRevealFinishSound schedules five high-pitch bings", () => {
		const { createOscillator, oscillators } = installMockAudioContext();

		playSlotRevealFinishSound();

		expect(createOscillator).toHaveBeenCalledTimes(
			PARTIALS_PER_BING * FINISH_BING_COUNT,
		);
		expect(oscillators[0]!.frequency.value).toBe(1568);
		expect(oscillators[PARTIALS_PER_BING]!.frequency.value).toBe(1568);
		expect(oscillators[0]!.type).toBe("sine");
		expect(oscillators[0]!.start).toHaveBeenCalled();
	});

	it("does not play when sounds are muted", () => {
		const { createOscillator } = installMockAudioContext();
		setSoundEnabled(false);

		warmUpSlotAudio();
		playSlotRevealFinishSound();

		expect(createOscillator).not.toHaveBeenCalled();
	});

	it("does not throw when AudioContext is unavailable", () => {
		vi.stubGlobal("AudioContext", undefined);
		vi.stubGlobal("webkitAudioContext", undefined);

		expect(() => warmUpSlotAudio()).not.toThrow();
		expect(() => playSlotRevealFinishSound()).not.toThrow();
	});
});
