import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepConfigWritingConfiguration from "@/components/molecules/steps/StepConfigWritingConfiguration.tsx";

describe("StepConfigWritingConfiguration", () => {
  const mockState = { context: {} };
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders writing configuration title and description", () => {
    render(() => (
      <StepConfigWritingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Writing configuration")).toBeInTheDocument();
    expect(
      screen.getByText(/Your settings are being sent to the microcontroller/i),
    ).toBeInTheDocument();
  });

  it("shows an accessible loading indicator", () => {
    render(() => (
      <StepConfigWritingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(
      screen.getByRole("status", { name: /loading/i }),
    ).toBeInTheDocument();
  });

  it("shows upload progress from machine context", () => {
    render(() => (
      <StepConfigWritingConfiguration
        state={{ context: { configWriteProgress: 0.5 } }}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Upload progress")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });
});
