import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { FormField } from "@/components/forms/FormField.tsx";

describe("FormField", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders children", () => {
		render(() => (
			<FormField>
				<input type="text" />
			</FormField>
		));
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
	});

	it("renders label when provided", () => {
		render(() => (
			<FormField label="Test Label">
				<input type="text" />
			</FormField>
		));
		expect(screen.getByText("Test Label")).toBeInTheDocument();
	});

	it("shows required indicator when required is true", () => {
		render(() => (
			<FormField label="Test Label" required>
				<input type="text" />
			</FormField>
		));
		expect(screen.getByText("*")).toBeInTheDocument();
	});

	it("displays error message", () => {
		const errorMessage = "This field is required";
		render(() => (
			<FormField label="Test Label" error={errorMessage}>
				<input type="text" />
			</FormField>
		));
		const error = screen.getByText(errorMessage);
		expect(error).toBeInTheDocument();
		expect(error).toHaveAttribute("role", "alert");
	});

	it("displays helper text", () => {
		const helperText = "This is helper text";
		render(() => (
			<FormField label="Test Label" helperText={helperText}>
				<input type="text" />
			</FormField>
		));
		expect(screen.getByText(helperText)).toBeInTheDocument();
	});

	it("does not show helper text when error is present", () => {
		const helperText = "This is helper text";
		const errorMessage = "This field is required";
		render(() => (
			<FormField
				label="Test Label"
				helperText={helperText}
				error={errorMessage}
			>
				<input type="text" />
			</FormField>
		));
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
		expect(screen.queryByText(helperText)).not.toBeInTheDocument();
	});

	it("applies custom class", () => {
		const { container } = render(() => (
			<FormField class="custom-class">
				<input type="text" />
			</FormField>
		));
		const field = container.querySelector("div");
		expect(field).toHaveClass("custom-class");
	});

	it("renders without label", () => {
		render(() => (
			<FormField>
				<input type="text" />
			</FormField>
		));
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
		expect(screen.queryByText(/Test Label/)).not.toBeInTheDocument();
	});
});
