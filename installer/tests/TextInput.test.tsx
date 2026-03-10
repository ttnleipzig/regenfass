import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { TextInput } from "../src/components/forms/TextInput";

describe("TextInput Component Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders input field without label", () => {
      render(() => <TextInput />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with label when provided", () => {
      render(() => <TextInput label="Test Label" />);
      
      expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("renders required indicator when required is true", () => {
      render(() => <TextInput label="Test Label" required />);
      
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(() => <TextInput label="Test Label" class="custom-class" />);
      
      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveClass("custom-class");
    });
  });

  describe("Input Attributes", () => {
    it("passes through standard input attributes", () => {
      render(() => (
        <TextInput 
          label="Test Label" 
          placeholder="Enter text"
          disabled
          maxLength={10}
          value="initial"
        />
      ));
      
      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveAttribute("placeholder", "Enter text");
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("maxLength", "10");
      expect(input).toHaveValue("initial");
    });

    it("handles different input types", () => {
      render(() => <TextInput label="Email" type="email" />);
      
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("type", "email");
    });

    it("sets autocomplete attribute", () => {
      render(() => <TextInput label="Email" autocomplete="email" />);
      
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("autocomplete", "email");
    });
  });

  describe("Error Handling", () => {
    it("displays error message when provided", () => {
      const errorMessage = "This field is required";
      render(() => <TextInput label="Test Label" error={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveAttribute("role", "alert");
    });

    it("sets aria-invalid when error is present", () => {
      render(() => <TextInput label="Test Label" error="Error message" />);
      
      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("connects error message via aria-describedby", () => {
      render(() => <TextInput label="Test Label" error="Error message" />);
      
      const input = screen.getByLabelText("Test Label");
      const errorElement = screen.getByText("Error message");
      
      expect(input).toHaveAttribute("aria-describedby");
      expect(input.getAttribute("aria-describedby")).toBe(errorElement.id);
    });

    it("prioritizes error over helper text", () => {
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
  });

  describe("Helper Text", () => {
    it("displays helper text when provided", () => {
      const helperText = "This is helper text";
      render(() => <TextInput label="Test Label" helperText={helperText} />);
      
      expect(screen.getByText(helperText)).toBeInTheDocument();
    });

    it("connects helper text via aria-describedby", () => {
      const helperText = "This is helper text";
      render(() => <TextInput label="Test Label" helperText={helperText} />);
      
      const input = screen.getByLabelText("Test Label");
      const helperElement = screen.getByText(helperText);
      
      expect(input).toHaveAttribute("aria-describedby");
      expect(input.getAttribute("aria-describedby")).toBe(helperElement.id);
    });
  });

  describe("Event Handling", () => {
    it("calls onChange handler when value changes", () => {
      const handleChange = vi.fn();
      render(() => <TextInput label="Test Label" onChange={handleChange} />);
      
      const input = screen.getByLabelText("Test Label");
      fireEvent.change(input, { target: { value: "test value" } });
      
      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onInput handler", () => {
      const handleInput = vi.fn();
      render(() => <TextInput label="Test Label" onInput={handleInput} />);
      
      const input = screen.getByLabelText("Test Label");
      fireEvent.input(input, { target: { value: "test" } });
      
      expect(handleInput).toHaveBeenCalled();
    });

    it("calls onBlur handler", () => {
      const handleBlur = vi.fn();
      render(() => <TextInput label="Test Label" onBlur={handleBlur} />);
      
      const input = screen.getByLabelText("Test Label");
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalled();
    });

    it("calls onFocus handler", () => {
      const handleFocus = vi.fn();
      render(() => <TextInput label="Test Label" onFocus={handleFocus} />);
      
      const input = screen.getByLabelText("Test Label");
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
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
      expect(firstInput.id).toBeTruthy();
      expect(secondInput.id).toBeTruthy();
    });

    it("associates label with input correctly", () => {
      render(() => <TextInput label="Test Label" />);
      
      const input = screen.getByLabelText("Test Label");
      const label = screen.getByText("Test Label");
      
      expect(label).toHaveAttribute("for", input.id);
    });

    it("maintains accessibility when no label provided", () => {
      render(() => <TextInput placeholder="Enter text" />);
      
      const input = screen.getByPlaceholderText("Enter text");
      expect(input).toBeInTheDocument();
      expect(input).not.toHaveAttribute("aria-labelledby");
    });
  });

  describe("Styling and States", () => {
    it("applies error styling when error is present", () => {
      render(() => <TextInput label="Test Label" error="Error" />);
      
      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveClass("border-red-500");
    });

    it("applies disabled styling when disabled", () => {
      render(() => <TextInput label="Test Label" disabled />);
      
      const input = screen.getByLabelText("Test Label");
      expect(input).toBeDisabled();
    });

    it("applies focus styling", () => {
      render(() => <TextInput label="Test Label" />);
      
      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveClass("focus-visible:ring-2");
    });
  });
});