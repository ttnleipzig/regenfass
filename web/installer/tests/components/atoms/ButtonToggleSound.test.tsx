import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { ButtonToggleSound } from "@regenfass/brand";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";

describe("ButtonToggleSound", () => {
	beforeEach(() => {
		resetSoundPreferenceForTests();
	});

	afterEach(() => {
		cleanup();
		resetSoundPreferenceForTests();
	});

	it("renders unmute control when sounds are disabled by default", () => {
		render(() => <ButtonToggleSound />);
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("toggles to mute label when sounds are enabled", () => {
		setSoundEnabled(true);
		render(() => <ButtonToggleSound />);
		expect(screen.getByRole("button", { name: /mute sounds/i })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /mute sounds/i }));
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("restores unmute label on second click from muted default", () => {
		render(() => <ButtonToggleSound />);
		fireEvent.click(screen.getByRole("button", { name: /unmute sounds/i }));
		fireEvent.click(screen.getByRole("button", { name: /mute sounds/i }));
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
	});
});
