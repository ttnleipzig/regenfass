import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepStartCheckingWebSerialSupport from "@/components/molecules/steps/StepStartCheckingWebSerialSupport.tsx";

describe("StepStartCheckingWebSerialSupport", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepStartCheckingWebSerialSupport
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Checking Web Serial support")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepStartCheckingWebSerialSupport
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(
      screen.getByText(
        "We are verifying that your browser supports the Web Serial API."
      )
    ).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepStartCheckingWebSerialSupport
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
