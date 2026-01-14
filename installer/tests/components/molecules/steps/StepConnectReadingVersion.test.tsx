import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepConnectReadingVersion from "@/components/molecules/steps/StepConnectReadingVersion.tsx";

describe("StepConnectReadingVersion", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepConnectReadingVersion state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Reading firmware version")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepConnectReadingVersion state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Gathering device information.")).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepConnectReadingVersion state={mockState} emitEvent={mockEmitEvent} />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
