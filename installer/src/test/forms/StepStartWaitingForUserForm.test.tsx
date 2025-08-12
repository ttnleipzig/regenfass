import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/solid";
import { StepStartWaitingForUserForm } from "../../installer/forms/StepStartWaitingForUserForm";

describe("StepStartWaitingForUserForm", () => {
  const mockSend = vi.fn();

  const defaultProps = {
    send: mockSend,
    upstreamVersions: ["1.0.0", "1.1.0", "1.2.0"]
  };

  beforeEach(() => {
    mockSend.mockClear();
  });

  it("renders correctly with title and subtitle", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    expect(screen.getByText("Willkommen beim Regenfass Installer")).toBeInTheDocument();
    expect(screen.getByText(/Dieser Assistent hilft Ihnen dabei/)).toBeInTheDocument();
  });

  it("displays available firmware versions", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    expect(screen.getByText("Verfügbare Firmware-Versionen:")).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.getByText("1.1.0")).toBeInTheDocument();
    expect(screen.getByText("1.2.0")).toBeInTheDocument();
  });

  it("shows preparation instructions", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    expect(screen.getByText("Vorbereitung")).toBeInTheDocument();
    expect(screen.getByText(/Stellen Sie sicher, dass Ihr Mikrocontroller/)).toBeInTheDocument();
  });

  it("requires checkbox confirmation", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    const checkbox = screen.getByRole("checkbox");
    const submitButton = screen.getByText("Installation starten");
    
    expect(checkbox).not.toBeChecked();
    expect(submitButton).toBeInTheDocument();
  });

  it("shows error when submitting without confirmation", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    const submitButton = screen.getByText("Installation starten");
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Bitte bestätigen Sie, dass Sie bereit sind/)).toBeInTheDocument();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends start.next event when confirmed and submitted", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    const checkbox = screen.getByRole("checkbox");
    const submitButton = screen.getByText("Installation starten");
    
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);
    
    expect(mockSend).toHaveBeenCalledWith({ type: "start.next" });
  });

  it("clears errors when checkbox is checked", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} />);
    
    const checkbox = screen.getByRole("checkbox");
    const submitButton = screen.getByText("Installation starten");
    
    // First submit without confirmation
    fireEvent.click(submitButton);
    expect(screen.getByText(/Bitte bestätigen Sie/)).toBeInTheDocument();
    
    // Then check checkbox and submit again
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);
    
    expect(screen.queryByText(/Bitte bestätigen Sie/)).not.toBeInTheDocument();
    expect(mockSend).toHaveBeenCalledWith({ type: "start.next" });
  });

  it("handles missing upstream versions gracefully", () => {
    render(() => <StepStartWaitingForUserForm send={mockSend} />);
    
    expect(screen.queryByText("Verfügbare Firmware-Versionen:")).not.toBeInTheDocument();
  });

  it("handles empty upstream versions array", () => {
    render(() => <StepStartWaitingForUserForm {...defaultProps} upstreamVersions={[]} />);
    
    expect(screen.queryByText("Verfügbare Firmware-Versionen:")).not.toBeInTheDocument();
  });
});
