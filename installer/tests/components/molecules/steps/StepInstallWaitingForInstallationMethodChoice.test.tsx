import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepInstallWaitingForInstallationMethodChoice from "@/components/molecules/steps/StepInstallWaitingForInstallationMethodChoice.tsx";
import { INSTALLATION_STEPS } from "@/components/molecules/steps/StepStartWaitingForUser.tsx";

describe("StepInstallWaitingForInstallationMethodChoice", () => {
  const mockState = {
    matches: vi.fn(
      (id: string) => id === "Install_WaitingForInstallationMethodChoice",
    ),
    can: vi.fn((event: any) => {
      if (event.type === "install.install") return true;
      if (event.type === "install.configure") return true;
      return false;
    }),
    context: {
      targetFirmwareVersion: "1.0.0",
      upstreamVersions: ["1.0.0", "1.1.0", "2.0.0"],
    },
  };
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Choose installation method")).toBeInTheDocument();
  });

  it("renders alert with description", () => {
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(
      screen.getByText("Install fresh or update existing firmware.")
    ).toBeInTheDocument();
  });

  it("renders install button", () => {
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByRole("button", { name: "Install" })).toBeInTheDocument();
  });

  it("renders configure button", () => {
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByRole("button", { name: "Configure" })).toBeInTheDocument();
  });

  it("calls emitEvent when install button is clicked", () => {
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const button = screen.getByRole("button", { name: "Install" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "install.install" });
  });

  it("calls emitEvent when configure button is clicked", () => {
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    const button = screen.getByRole("button", { name: "Configure" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "install.configure" });
  });

  it("disables install button when state.can returns false", () => {
    const stateWithDisabledInstall = {
      ...mockState,
      can: vi.fn((event: any) => {
        if (event.type === "install.install") return false;
        if (event.type === "install.configure") return true;
        return false;
      }),
    };
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={stateWithDisabledInstall}
        emitEvent={mockEmitEvent}
      />
    ));
    const button = screen.getByRole("button", { name: "Install" });
    expect(button).toBeDisabled();
  });

  it("disables configure button when state.can returns false", () => {
    const stateWithDisabledConfigure = {
      ...mockState,
      can: vi.fn((event: any) => {
        if (event.type === "install.install") return true;
        if (event.type === "install.configure") return false;
        return false;
      }),
    };
    render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={stateWithDisabledConfigure}
        emitEvent={mockEmitEvent}
      />
    ));
    const button = screen.getByRole("button", { name: "Configure" });
    expect(button).toBeDisabled();
  });

  it("renders vertical installation step paginator", () => {
    const { container } = render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText("Installation")).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Installation steps" });
    expect(list).toHaveClass("flex-col");
    for (const label of INSTALLATION_STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const badges = container.querySelectorAll("ol > li > span[aria-hidden='true']");
    expect(badges[1]?.className).toContain("bg-primary");
    expect(badges[1]?.className).toContain("text-primary-foreground");
  });

  it("renders select field", () => {
    const { container } = render(() => (
      <StepInstallWaitingForInstallationMethodChoice
        state={mockState}
        emitEvent={mockEmitEvent}
      />
    ));
    // The SelectField should be rendered (checking by trigger button)
    const selectTrigger = container.querySelector('[role="group"]');
    expect(selectTrigger).toBeInTheDocument();
    // Since a value is selected (1.0.0), check for that instead of placeholder
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
  });
});
