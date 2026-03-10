import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepStartFetchUpstreamVersions from "@/components/molecules/steps/StepStartFetchUpstreamVersions.tsx";

describe("StepStartFetchUpstreamVersions", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepStartFetchUpstreamVersions
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Fetching versions")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepStartFetchUpstreamVersions
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(
      screen.getByText("Getting the latest available firmware versions.")
    ).toBeInTheDocument();
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepStartFetchUpstreamVersions
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
