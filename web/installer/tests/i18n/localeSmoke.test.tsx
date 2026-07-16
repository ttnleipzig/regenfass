import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { LocaleProvider, useLocale } from "@regenfass/brand";
import StepStartWaitingForUser from "@/components/molecules/steps/StepStartWaitingForUser.tsx";
import { installerDictDe } from "@/i18n/de.ts";

function LocaleProbe() {
	const { locale, setLocale } = useLocale();
	return (
		<div>
			<span data-testid="locale">{locale()}</span>
			<button type="button" onClick={() => setLocale("de")}>
				to-de
			</button>
			<button type="button" onClick={() => setLocale("en")}>
				to-en
			</button>
		</div>
	);
}

describe("installer locale smoke", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders German welcome copy after setLocale(de)", async () => {
		const mockState = {
			matches: (id: string) => id === "Start_WaitingForUser",
		};

		render(() => (
			<LocaleProvider initialLocale="en">
				<StepStartWaitingForUser state={mockState} emitEvent={() => {}} />
				<LocaleProbe />
			</LocaleProvider>
		));

		expect(screen.getByText("Waiting for your confirmation")).toBeInTheDocument();

		screen.getByRole("button", { name: "to-de" }).click();

		expect(
			await screen.findByText(installerDictDe.startWaitingForUser.alertTitle),
		).toBeInTheDocument();
		expect(screen.getByTestId("locale")).toHaveTextContent("de");
	});
});
