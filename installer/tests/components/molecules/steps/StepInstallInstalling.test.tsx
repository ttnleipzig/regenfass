import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepInstallInstalling from "@/components/molecules/steps/StepInstallInstalling.tsx";

describe("StepInstallInstalling", () => {
	const mockState = {};
	const mockEmitEvent = vi.fn();

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders alert with title", () => {
		render(() => (
			<StepInstallInstalling state={mockState} emitEvent={mockEmitEvent} />
		));
		expect(screen.getByText("Installing")).toBeInTheDocument();
	});

	it("renders description about USB and firmware", () => {
		render(() => (
			<StepInstallInstalling state={mockState} emitEvent={mockEmitEvent} />
		));
		expect(
			screen.getByText(
				/Firmware is being written to the microcontroller over USB/,
			),
		).toBeInTheDocument();
	});

	it("uses AlertInline component", () => {
		const { container } = render(() => (
			<StepInstallInstalling state={mockState} emitEvent={mockEmitEvent} />
		));
		const alert = container.querySelector('[role="alert"]');
		expect(alert).toBeInTheDocument();
	});

	it("shows upload progress percent from installFlashProgress", () => {
		render(() => (
			<StepInstallInstalling
				state={{ context: { installFlashProgress: 0.42 } }}
				emitEvent={mockEmitEvent}
			/>
		));
		expect(screen.getByText("42%")).toBeInTheDocument();
	});
});
