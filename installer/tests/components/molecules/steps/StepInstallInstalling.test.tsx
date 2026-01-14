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

  it("renders alert with description", () => {
    render(() => (
      <StepInstallInstalling state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(
      screen.getByText("Flashing firmware to the device...")
    ).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepInstallInstalling state={mockState} emitEvent={mockEmitEvent} />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
