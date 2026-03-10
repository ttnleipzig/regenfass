import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { Checkbox } from "@/components/forms/Checkbox.tsx";

describe("Checkbox", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders checkbox input", () => {
		render(() => <Checkbox />);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeInTheDocument();
		expect(checkbox).toHaveAttribute("type", "checkbox");
	});

	it("renders with label", () => {
		render(() => <Checkbox label="Test Checkbox" />);
		// There are two labels: one from FormField and one for the checkbox input
		const labels = screen.getAllByText("Test Checkbox");
		expect(labels.length).toBeGreaterThan(0);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeInTheDocument();
	});

	it("shows required indicator when required is true", () => {
		render(() => <Checkbox label="Test Checkbox" required />);
		expect(screen.getByText("*")).toBeInTheDocument();
	});

	it("displays error message", () => {
		const errorMessage = "This field is required";
		render(() => <Checkbox label="Test Checkbox" error={errorMessage} />);
		const error = screen.getByText(errorMessage);
		expect(error).toBeInTheDocument();
		expect(error).toHaveAttribute("role", "alert");
	});

	it("displays helper text", () => {
		const helperText = "This is helper text";
		render(() => (
			<Checkbox label="Test Checkbox" helperText={helperText} />
		));
		expect(screen.getByText(helperText)).toBeInTheDocument();
	});

	it("handles checkbox change", () => {
		const handleChange = vi.fn();
		render(() => (
			<Checkbox label="Test Checkbox" onChange={handleChange} />
		));
		const checkbox = screen.getByRole("checkbox");
		fireEvent.click(checkbox);
		expect(handleChange).toHaveBeenCalled();
	});

	it("applies error styling when error is present", () => {
		const { container } = render(() => (
			<Checkbox label="Test Checkbox" error="Error message" />
		));
		const checkbox = container.querySelector('input[type="checkbox"]');
		expect(checkbox).toHaveClass("border-red-500");
	});

	it("applies custom class", () => {
		const { container } = render(() => (
			<Checkbox label="Test Checkbox" class="custom-class" />
		));
		const wrapper = container.querySelector("div.flex");
		expect(wrapper).toHaveClass("custom-class");
	});

	it("has proper accessibility attributes when error is present", () => {
		const errorMessage = "This field is required";
		render(() => <Checkbox label="Test Checkbox" error={errorMessage} />);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toHaveAttribute("aria-invalid", "true");
	});

	it("can be checked", () => {
		render(() => <Checkbox label="Test Checkbox" checked />);
		const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
		expect(checkbox.checked).toBe(true);
	});

	it("can be disabled", () => {
		render(() => <Checkbox label="Test Checkbox" disabled />);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeDisabled();
	});
});
