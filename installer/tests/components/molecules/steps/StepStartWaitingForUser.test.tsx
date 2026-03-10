import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepStartWaitingForUser from "@/components/molecules/steps/StepStartWaitingForUser.tsx";

describe("StepStartWaitingForUser", () => {
  const mockState = {};
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepStartWaitingForUser state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Waiting for your confirmation")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepStartWaitingForUser state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Please confirm to continue.")).toBeInTheDocument();
  });

  it("renders next button", () => {
    render(() => (
      <StepStartWaitingForUser state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("calls emitEvent when next button is clicked", () => {
    render(() => (
      <StepStartWaitingForUser state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "Next" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "start.next" });
  });

  it("uses AlertInline component", () => {
    const { container } = render(() => (
      <StepStartWaitingForUser state={mockState} emitEvent={mockEmitEvent} />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
