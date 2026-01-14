import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepConnectConnecting from "@/components/molecules/steps/StepConnectConnecting.tsx";

describe("StepConnectConnecting", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepConnectConnecting state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Connecting")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepConnectConnecting state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Trying to connect to your device.")).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepConnectConnecting state={mockState} emitEvent={mockEmitEvent} />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
