import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { InputField } from "@/components/forms/InputField.tsx";

describe("InputField", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders input element", () => {
		render(() => <InputField />);
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
	});

	it("renders with label", () => {
		render(() => <InputField label="Test Label" />);
		expect(screen.getByText("Test Label")).toBeInTheDocument();
		const input = screen.getByLabelText("Test Label");
		expect(input).toBeInTheDocument();
	});

	it("displays error message", () => {
		const errorMessage = "This field is required";
		render(() => <InputField label="Test Label" error={errorMessage} />);
		const error = screen.getByText(errorMessage);
		expect(error).toBeInTheDocument();
		expect(error).toHaveAttribute("role", "alert");
	});

	it("displays helper text", () => {
		const helperText = "This is helper text";
		render(() => (
			<InputField label="Test Label" helperText={helperText} />
		));
		expect(screen.getByText(helperText)).toBeInTheDocument();
	});

	it("does not show helper text when error is present", () => {
		const helperText = "This is helper text";
		const errorMessage = "This field is required";
		render(() => (
			<InputField
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
		render(() => (
			<InputField label="Test Label" onChange={handleChange} />
		));
		const input = screen.getByLabelText("Test Label");
		fireEvent.change(input, { target: { value: "test value" } });
		expect(handleChange).toHaveBeenCalled();
	});

	it("applies custom class", () => {
		render(() => <InputField label="Test Label" class="custom-class" />);
		const input = screen.getByLabelText("Test Label");
		expect(input).toHaveClass("custom-class");
	});

	it("applies error styling when error is present", () => {
		render(() => (
			<InputField label="Test Label" error="Error message" />
		));
		const input = screen.getByLabelText("Test Label");
		expect(input).toHaveClass("border-red-500");
	});

	it("has proper accessibility attributes when error is present", () => {
		const errorMessage = "This field is required";
		render(() => <InputField label="Test Label" error={errorMessage} />);
		const input = screen.getByLabelText("Test Label");
		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(input).toHaveAttribute("aria-describedby");
	});

	it("has proper accessibility attributes when helper text is present", () => {
		const helperText = "This is helper text";
		render(() => (
			<InputField label="Test Label" helperText={helperText} />
		));
		const input = screen.getByLabelText("Test Label");
		expect(input).toHaveAttribute("aria-describedby");
	});

	it("passes through other input attributes", () => {
		render(() => (
			<InputField
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

	it("generates unique IDs for multiple instances", () => {
		render(() => (
			<div>
				<InputField label="First InputField" />
				<InputField label="Second InputField" />
			</div>
		));
		const firstInput = screen.getByLabelText("First InputField");
		const secondInput = screen.getByLabelText("Second InputField");
		expect(firstInput.id).not.toBe(secondInput.id);
	});
});
