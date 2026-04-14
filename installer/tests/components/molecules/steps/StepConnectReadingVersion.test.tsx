import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import StepConnectReadingVersion from "@/components/molecules/steps/StepConnectReadingVersion.tsx";
import { INSTALLATION_STEPS } from "@/components/molecules/steps/StepStartWaitingForUser.tsx";

describe("StepConnectReadingVersion", () => {
  const mockState = {
    matches: vi.fn((id: string) => id === "Connect_ReadingVersion"),
  };
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

  it("renders installation step paginator with accessible list", () => {
    const { container } = render(() => (
      <StepConnectReadingVersion state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Installation")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Installation steps" }),
    ).toBeInTheDocument();
    for (const label of INSTALLATION_STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const badges = container.querySelectorAll("ol > li > span[aria-hidden='true']");
    expect(badges[0]?.className).toContain("bg-primary");
    expect(badges[0]?.className).toContain("text-primary-foreground");
  });
});
