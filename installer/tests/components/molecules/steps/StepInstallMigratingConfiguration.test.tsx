import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepInstallMigratingConfiguration from "@/components/molecules/steps/StepInstallMigratingConfiguration.tsx";

describe("StepInstallMigratingConfiguration", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepInstallMigratingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Migrating configuration")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepInstallMigratingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Keeping your settings safe.")).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepInstallMigratingConfiguration
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
