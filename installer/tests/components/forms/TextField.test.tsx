import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import {
	TextFieldRoot,
	TextFieldInput,
	TextFieldLabel,
	TextFieldDescription,
	TextFieldErrorMessage,
} from "@/components/forms/TextField.tsx";

describe("TextField", () => {
	afterEach(() => {
		cleanup();
	});

	describe("TextFieldRoot", () => {
		it("renders root element", () => {
			const { container } = render(() => (
				<TextFieldRoot>
					<TextFieldInput />
				</TextFieldRoot>
			));
			const root = container.querySelector("div");
			expect(root).toBeInTheDocument();
		});

		it("applies custom class", () => {
			const { container } = render(() => (
				<TextFieldRoot class="custom-class">
					<TextFieldInput />
				</TextFieldRoot>
			));
			const root = container.querySelector("div");
			expect(root).toHaveClass("custom-class");
		});
	});

	describe("TextFieldLabel", () => {
		it("renders label element", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldLabel>Test Label</TextFieldLabel>
					<TextFieldInput />
				</TextFieldRoot>
			));
			expect(screen.getByText("Test Label")).toBeInTheDocument();
		});

		it("applies custom class", () => {
			const { container } = render(() => (
				<TextFieldRoot>
					<TextFieldLabel class="custom-class">Test Label</TextFieldLabel>
					<TextFieldInput />
				</TextFieldRoot>
			));
			const label = container.querySelector("label");
			expect(label).toHaveClass("custom-class");
		});
	});

	describe("TextFieldInput", () => {
		it("renders input element", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldInput />
				</TextFieldRoot>
			));
			const input = screen.getByRole("textbox");
			expect(input).toBeInTheDocument();
		});

		it("handles value changes", () => {
			const handleChange = vi.fn();
			render(() => (
				<TextFieldRoot>
					<TextFieldInput onChange={handleChange} />
				</TextFieldRoot>
			));
			const input = screen.getByRole("textbox");
			fireEvent.change(input, { target: { value: "test value" } });
			expect(handleChange).toHaveBeenCalled();
		});

		it("applies custom class", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldInput class="custom-class" />
				</TextFieldRoot>
			));
			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("custom-class");
		});

		it("passes through input attributes", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldInput
						placeholder="Enter text"
						disabled
						maxLength={10}
					/>
				</TextFieldRoot>
			));
			const input = screen.getByRole("textbox");
			expect(input).toHaveAttribute("placeholder", "Enter text");
			expect(input).toBeDisabled();
			expect(input).toHaveAttribute("maxLength", "10");
		});
	});

	describe("TextFieldDescription", () => {
		it("renders description text", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldInput />
					<TextFieldDescription>Helper text</TextFieldDescription>
				</TextFieldRoot>
			));
			expect(screen.getByText("Helper text")).toBeInTheDocument();
		});

		it("applies custom class", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldInput />
					<TextFieldDescription class="custom-class">
						Helper text
					</TextFieldDescription>
				</TextFieldRoot>
			));
			const desc = screen.getByText("Helper text");
			expect(desc).toHaveClass("custom-class");
		});
	});

	describe("TextFieldErrorMessage", () => {
		it("renders error message", () => {
			render(() => (
				<TextFieldRoot validationState="invalid">
					<TextFieldInput />
					<TextFieldErrorMessage>Error message</TextFieldErrorMessage>
				</TextFieldRoot>
			));
			const error = screen.getByText("Error message");
			expect(error).toBeInTheDocument();
		});

		it("applies custom class", () => {
			render(() => (
				<TextFieldRoot validationState="invalid">
					<TextFieldInput />
					<TextFieldErrorMessage class="custom-class">
						Error message
					</TextFieldErrorMessage>
				</TextFieldRoot>
			));
			const error = screen.getByText("Error message");
			expect(error).toHaveClass("custom-class");
		});
	});

	describe("TextField composition", () => {
		it("renders complete field structure", () => {
			render(() => (
				<TextFieldRoot>
					<TextFieldLabel>Test Label</TextFieldLabel>
					<TextFieldInput />
					<TextFieldDescription>Helper text</TextFieldDescription>
				</TextFieldRoot>
			));
			expect(screen.getByText("Test Label")).toBeInTheDocument();
			expect(screen.getByRole("textbox")).toBeInTheDocument();
			expect(screen.getByText("Helper text")).toBeInTheDocument();
		});

		it("renders with error message", () => {
			render(() => (
				<TextFieldRoot validationState="invalid">
					<TextFieldLabel>Test Label</TextFieldLabel>
					<TextFieldInput />
					<TextFieldErrorMessage>Error message</TextFieldErrorMessage>
				</TextFieldRoot>
			));
			expect(screen.getByText("Test Label")).toBeInTheDocument();
			expect(screen.getByRole("textbox")).toBeInTheDocument();
			expect(screen.getByText("Error message")).toBeInTheDocument();
		});
	});
});
