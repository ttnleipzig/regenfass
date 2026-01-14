import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepConfigWritingConfiguration from "@/components/molecules/steps/StepConfigWritingConfiguration.tsx";

describe("StepConfigWritingConfiguration", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders writing configuration message", () => {
    render(() => (
      <StepConfigWritingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Writing configuration...")).toBeInTheDocument();
  });

  it("renders as span element", () => {
    const { container } = render(() => (
      <StepConfigWritingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe("Writing configuration...");
  });
});
