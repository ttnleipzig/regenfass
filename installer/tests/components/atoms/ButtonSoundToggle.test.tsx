import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { ButtonSoundToggle } from "@/components/atoms/ButtonSoundToggle.tsx";
import { resetSoundPreferenceForTests } from "@/libs/soundPreference.ts";

describe("ButtonSoundToggle", () => {
	beforeEach(() => {
		resetSoundPreferenceForTests();
	});

	afterEach(() => {
		cleanup();
		resetSoundPreferenceForTests();
	});

	it("renders mute control with sounds enabled by default", () => {
		render(() => <ButtonSoundToggle />);
		expect(screen.getByRole("button", { name: /mute sounds/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /mute sounds/i })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
	});

	it("toggles to unmute label when clicked", () => {
		render(() => <ButtonSoundToggle />);
		const button = screen.getByRole("button", { name: /mute sounds/i });
		fireEvent.click(button);
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /unmute sounds/i })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("restores mute label on second click", () => {
		render(() => <ButtonSoundToggle />);
		const button = screen.getByRole("button", { name: /mute sounds/i });
		fireEvent.click(button);
		fireEvent.click(screen.getByRole("button", { name: /unmute sounds/i }));
		expect(screen.getByRole("button", { name: /mute sounds/i })).toBeInTheDocument();
	});
});
