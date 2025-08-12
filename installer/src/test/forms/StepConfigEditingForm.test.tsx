import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/solid";
import { StepConfigEditingForm } from "../../installer/forms/StepConfigEditingForm";

describe("StepConfigEditingForm", () => {
  const mockSend = vi.fn();

  const defaultProps = {
    send: mockSend,
    configuration: {
      firmwareVersion: "1.0.0",
      configVersion: "1.0",
      appEUI: "",
      appKey: "",
      devEUI: ""
    }
  };

  beforeEach(() => {
    mockSend.mockClear();
  });

  it("renders correctly with title and subtitle", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    expect(screen.getByText("LoRaWAN Konfiguration")).toBeInTheDocument();
    expect(screen.getByText(/Konfigurieren Sie die LoRaWAN-Parameter/)).toBeInTheDocument();
  });

  it("displays all required form fields", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/AppEUI/)).toBeInTheDocument();
    expect(screen.getByLabelText(/AppKey/)).toBeInTheDocument();
    expect(screen.getByLabelText(/DevEUI/)).toBeInTheDocument();
  });

  it("shows helper text for form fields", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    expect(screen.getByText("16-stellige Hexadezimalzahl")).toBeInTheDocument();
    expect(screen.getByText("32-stellige Hexadezimalzahl")).toBeInTheDocument();
  });

  it("validates required fields", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const submitButton = screen.getByText("Konfiguration speichern");
    fireEvent.click(submitButton);
    
    expect(screen.getByText("Dieses Feld ist erforderlich.")).toBeInTheDocument();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("validates hex format for AppEUI", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const appEUIInput = screen.getByLabelText(/AppEUI/);
    fireEvent.change(appEUIInput, { target: { value: "invalid" } });
    
    expect(screen.getByText(/AppEUI muss 16 Hexadezimalzeichen lang sein/)).toBeInTheDocument();
  });

  it("validates hex format for AppKey", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const appKeyInput = screen.getByLabelText(/AppKey/);
    fireEvent.change(appKeyInput, { target: { value: "invalid" } });
    
    expect(screen.getByText(/AppKey muss 32 Hexadezimalzeichen lang sein/)).toBeInTheDocument();
  });

  it("validates hex format for DevEUI", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const devEUIInput = screen.getByLabelText(/DevEUI/);
    fireEvent.change(devEUIInput, { target: { value: "invalid" } });
    
    expect(screen.getByText(/DevEUI muss 16 Hexadezimalzeichen lang sein/)).toBeInTheDocument();
  });

  it("accepts valid hex values", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const appEUIInput = screen.getByLabelText(/AppEUI/);
    const appKeyInput = screen.getByLabelText(/AppKey/);
    const devEUIInput = screen.getByLabelText(/DevEUI/);
    
    fireEvent.change(appEUIInput, { target: { value: "0000000000000000" } });
    fireEvent.change(appKeyInput, { target: { value: "00000000000000000000000000000000" } });
    fireEvent.change(devEUIInput, { target: { value: "0000000000000000" } });
    
    // Should not show validation errors
    expect(screen.queryByText(/muss.*Hexadezimalzeichen lang sein/)).not.toBeInTheDocument();
  });

  it("sends config.changeField events when fields change", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const appEUIInput = screen.getByLabelText(/AppEUI/);
    fireEvent.change(appEUIInput, { target: { value: "0000000000000000" } });
    
    expect(mockSend).toHaveBeenCalledWith({
      type: "config.changeField",
      field: "appEUI",
      value: "0000000000000000"
    });
  });

  it("sends config.next event when form is valid and submitted", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    // Fill in valid values
    const appEUIInput = screen.getByLabelText(/AppEUI/);
    const appKeyInput = screen.getByLabelText(/AppKey/);
    const devEUIInput = screen.getByLabelText(/DevEUI/);
    
    fireEvent.change(appEUIInput, { target: { value: "0000000000000000" } });
    fireEvent.change(appKeyInput, { target: { value: "00000000000000000000000000000000" } });
    fireEvent.change(devEUIInput, { target: { value: "0000000000000000" } });
    
    const submitButton = screen.getByText("Konfiguration speichern");
    fireEvent.click(submitButton);
    
    expect(mockSend).toHaveBeenCalledWith({ type: "config.next" });
  });

  it("sends config.clear event when clear button is clicked", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const clearButton = screen.getByText("Konfiguration löschen");
    fireEvent.click(clearButton);
    
    expect(mockSend).toHaveBeenCalledWith({ type: "config.clear" });
  });

  it("sends config.saveToFile event when save button is clicked", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const saveButton = screen.getByText("Konfiguration exportieren");
    fireEvent.click(saveButton);
    
    expect(mockSend).toHaveBeenCalledWith({ type: "config.saveToFile" });
  });

  it("displays system information when available", () => {
    const configWithSystemInfo = {
      ...defaultProps.configuration,
      firmwareVersion: "1.2.3",
      configVersion: "2.0"
    };
    
    render(() => <StepConfigEditingForm {...defaultProps} configuration={configWithSystemInfo} />);
    
    expect(screen.getByText("System-Informationen")).toBeInTheDocument();
    expect(screen.getByText("1.2.3")).toBeInTheDocument();
    expect(screen.getByText("2.0")).toBeInTheDocument();
  });

  it("handles file upload for configuration import", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    expect(screen.getByText("Konfiguration importieren")).toBeInTheDocument();
    expect(screen.getByText("Wählen Sie eine JSON-Konfigurationsdatei aus")).toBeInTheDocument();
  });

  it("shows error for invalid JSON file", () => {
    render(() => <StepConfigEditingForm {...defaultProps} />);
    
    const fileInput = screen.getByLabelText(/Konfiguration importieren/);
    const file = new File(['invalid json'], 'config.json', { type: 'application/json' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/Ungültige Konfigurationsdatei/)).toBeInTheDocument();
  });
});
