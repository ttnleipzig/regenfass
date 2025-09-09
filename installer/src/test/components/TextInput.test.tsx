import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { TextInput } from "../../components/forms/TextInput";

describe("TextInput", () => {
  it("renders correctly with label", () => {
    render(() => <TextInput label="Test Label" />);
    
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(() => <TextInput />);
    
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("shows required indicator when required is true", () => {
    render(() => <TextInput label="Test Label" required />);
    
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message", () => {
    const errorMessage = "This field is required";
    render(() => <TextInput label="Test Label" error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveAttribute("role", "alert");
  });

  it("displays helper text", () => {
    const helperText = "This is helper text";
    render(() => <TextInput label="Test Label" helperText={helperText} />);
    
    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  it("does not show helper text when error is present", () => {
    const helperText = "This is helper text";
    const errorMessage = "This field is required";
    
    render(() => (
      <TextInput 
        label="Test Label" 
        helperText={helperText} 
        error={errorMessage} 
      />
    ));
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText(helperText)).not.toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(() => <TextInput label="Test Label" onChange={handleChange} />);
    
    const input = screen.getByLabelText("Test Label");
    fireEvent.change(input, { target: { value: "test value" } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it("applies custom class", () => {
    render(() => <TextInput label="Test Label" class="custom-class" />);
    
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveClass("custom-class");
  });

  it("passes through other input attributes", () => {
    render(() => (
      <TextInput 
        label="Test Label" 
        placeholder="Enter text"
        disabled
        maxLength={10}
      />
    ));
    
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("has proper accessibility attributes when error is present", () => {
    const errorMessage = "This field is required";
    render(() => <TextInput label="Test Label" error={errorMessage} />);
    
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("has proper accessibility attributes when helper text is present", () => {
    const helperText = "This is helper text";
    render(() => <TextInput label="Test Label" helperText={helperText} />);
    
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("generates unique IDs for multiple instances", () => {
    render(() => (
      <div>
        <TextInput label="First Input" />
        <TextInput label="Second Input" />
      </div>
    ));
    
    const firstInput = screen.getByLabelText("First Input");
    const secondInput = screen.getByLabelText("Second Input");
    
    expect(firstInput.id).not.toBe(secondInput.id);
  });
});
