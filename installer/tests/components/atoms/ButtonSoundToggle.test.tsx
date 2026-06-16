import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { ButtonSoundToggle } from "@/components/atoms/ButtonSoundToggle.tsx";
import { resetSoundPreferenceForTests, setSoundEnabled } from "@/libs/soundPreference.ts";

describe("ButtonSoundToggle", () => {
	beforeEach(() => {
		resetSoundPreferenceForTests();
	});

	afterEach(() => {
		cleanup();
		resetSoundPreferenceForTests();
	});

	it("renders unmute control when sounds are disabled by default", () => {
		render(() => <ButtonSoundToggle />);
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("toggles to mute label when sounds are enabled", () => {
		setSoundEnabled(true);
		render(() => <ButtonSoundToggle />);
		expect(screen.getByRole("button", { name: /mute sounds/i })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /mute sounds/i }));
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("restores unmute label on second click from muted default", () => {
		render(() => <ButtonSoundToggle />);
		fireEvent.click(screen.getByRole("button", { name: /unmute sounds/i }));
		fireEvent.click(screen.getByRole("button", { name: /mute sounds/i }));
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
	});
});
