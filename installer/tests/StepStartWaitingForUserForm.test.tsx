import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { StepStartWaitingForUserForm } from "../src/installer/forms/StepStartWaitingForUserForm";

describe("StepStartWaitingForUserForm Unit Tests", () => {
  const mockSend = vi.fn();

  const defaultProps = {
    send: mockSend,
    upstreamVersions: ["1.0.0", "1.1.0", "1.2.0"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders welcome title and description", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      expect(screen.getByText("Willkommen beim Regenfass Installer")).toBeInTheDocument();
      expect(screen.getByText(/Dieser Assistent hilft Ihnen dabei/)).toBeInTheDocument();
    });

    it("displays available firmware versions when provided", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      expect(screen.getByText("Verfügbare Firmware-Versionen:")).toBeInTheDocument();
      expect(screen.getByText("1.0.0")).toBeInTheDocument();
      expect(screen.getByText("1.1.0")).toBeInTheDocument();
      expect(screen.getByText("1.2.0")).toBeInTheDocument();
    });

    it("hides firmware versions section when no versions provided", () => {
      render(() => <StepStartWaitingForUserForm send={mockSend} />);
      
      expect(screen.queryByText("Verfügbare Firmware-Versionen:")).not.toBeInTheDocument();
    });

    it("hides firmware versions section when empty array provided", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} upstreamVersions={[]} />);
      
      expect(screen.queryByText("Verfügbare Firmware-Versionen:")).not.toBeInTheDocument();
    });

    it("displays preparation instructions", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      expect(screen.getByText("Vorbereitung")).toBeInTheDocument();
      expect(screen.getByText(/Stellen Sie sicher, dass Ihr Mikrocontroller/)).toBeInTheDocument();
    });

    it("renders checkbox and submit button", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByText("Installation starten");
      
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("prevents submission when checkbox is not checked", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const submitButton = screen.getByText("Installation starten");
      fireEvent.click(submitButton);
      
      expect(mockSend).not.toHaveBeenCalled();
      expect(screen.getByText(/Bitte bestätigen Sie/)).toBeInTheDocument();
    });

    it("allows submission when checkbox is checked", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByText("Installation starten");
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      fireEvent.click(submitButton);
      
      expect(mockSend).toHaveBeenCalledWith({ type: "start.next" });
    });

    it("clears validation error when checkbox is checked", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByText("Installation starten");
      
      // Submit without checking - should show error
      fireEvent.click(submitButton);
      expect(screen.getByText(/Bitte bestätigen Sie/)).toBeInTheDocument();
      
      // Check checkbox - error should clear
      fireEvent.click(checkbox);
      expect(screen.queryByText(/Bitte bestätigen Sie/)).not.toBeInTheDocument();
    });
  });

  describe("Event Handling", () => {
    it("sends correct event type on valid form submission", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByText("Installation starten");
      
      fireEvent.click(checkbox);
      fireEvent.click(submitButton);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({ type: "start.next" });
    });

    it("does not send event on invalid form submission", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const submitButton = screen.getByText("Installation starten");
      fireEvent.click(submitButton);
      
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("associates checkbox label correctly", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByLabelText(/Ich bestätige, dass ich bereit bin/);
      
      expect(checkbox).toBe(label);
    });

    it("marks required field with asterisk", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("provides proper form structure", () => {
      render(() => <StepStartWaitingForUserForm {...defaultProps} />);
      
      const form = screen.getByRole("form");
      expect(form).toBeInTheDocument();
    });
  });
});