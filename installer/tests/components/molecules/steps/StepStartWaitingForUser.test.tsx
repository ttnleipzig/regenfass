import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepStartWaitingForUser from "@/components/molecules/steps/StepStartWaitingForUser.tsx";

describe("StepStartWaitingForUser", () => {
  const mockState = {
    matches: vi.fn((id: string) => id === "Start_WaitingForUser"),
  };
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

  it("highlights installation step 1 from machine state", () => {
    const { container } = render(() => (
      <StepStartWaitingForUser state={mockState} emitEvent={mockEmitEvent} />
    ));
    const badges = container.querySelectorAll("ol > li > span[aria-hidden='true']");
    expect(badges[0]?.className).toContain("bg-primary");
    expect(badges[0]?.className).toContain("text-primary-foreground");
  });
});
