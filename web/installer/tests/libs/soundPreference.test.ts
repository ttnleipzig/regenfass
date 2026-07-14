import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	isSoundEnabled,
	resetSoundPreferenceForTests,
	setSoundEnabled,
	toggleSoundEnabled,
} from "@/libs/soundPreference.ts";

describe("soundPreference", () => {
	beforeEach(() => {
		resetSoundPreferenceForTests();
	});

	afterEach(() => {
		resetSoundPreferenceForTests();
	});

	it("defaults to sounds disabled", () => {
		expect(isSoundEnabled()).toBe(false);
	});

	it("updates in-memory preference when disabled", () => {
		setSoundEnabled(false);
		expect(isSoundEnabled()).toBe(false);
	});

	it("handles localStorage errors gracefully", () => {
		const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("Storage unavailable");
		});
		expect(() => setSoundEnabled(false)).not.toThrow();
		expect(isSoundEnabled()).toBe(false);
		setItemSpy.mockRestore();
	});

	it("toggleSoundEnabled flips the value", () => {
		expect(toggleSoundEnabled()).toBe(true);
		expect(isSoundEnabled()).toBe(true);
		expect(toggleSoundEnabled()).toBe(false);
		expect(isSoundEnabled()).toBe(false);
	});
});
