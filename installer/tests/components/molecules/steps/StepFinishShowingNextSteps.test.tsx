import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepFinishShowingNextSteps from "@/components/molecules/steps/StepFinishShowingNextSteps.tsx";

describe("StepFinishShowingNextSteps", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepFinishShowingNextSteps
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Next steps")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepFinishShowingNextSteps
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(
      screen.getByText("All set. You can now use your device.")
    ).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepFinishShowingNextSteps
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
