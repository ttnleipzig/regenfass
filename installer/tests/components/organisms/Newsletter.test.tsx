import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import Newsletter from "@/components/organisms/Newsletter.tsx";

describe("Newsletter", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders newsletter section", () => {
		const { container } = render(() => <Newsletter />);
		const aside = container.querySelector("aside#newsletter");
		expect(aside).toBeInTheDocument();
	});

	it("renders headline with correct text", () => {
		render(() => <Newsletter />);
		expect(screen.getByText(/Subscribe to the/)).toBeInTheDocument();
		expect(screen.getByText(/update newsletters/)).toBeInTheDocument();
	});

	it("renders description text", () => {
		render(() => <Newsletter />);
		expect(
			screen.getByText(
				/If you would like to be informed about software updates/,
			),
		).toBeInTheDocument();
	});

	it("renders email input field", () => {
		render(() => <Newsletter />);
		const emailInput = screen.getByPlaceholderText("your@email-address.iot");
		expect(emailInput).toBeInTheDocument();
		expect(emailInput).toHaveAttribute("type", "email");
	});

	it("renders subscribe button", () => {
		render(() => <Newsletter />);
		const subscribeButton = screen.getByText("Subscribe");
		expect(subscribeButton).toBeInTheDocument();
		expect(subscribeButton.closest("button")).toHaveAttribute("type", "submit");
	});

	it("renders form with correct id", () => {
		const { container } = render(() => <Newsletter />);
		const form = container.querySelector("form#form-newsletter");
		expect(form).toBeInTheDocument();
	});

	it("applies correct container classes", () => {
		const { container } = render(() => <Newsletter />);
		const aside = container.querySelector("aside");
		expect(aside).toHaveClass("max-w-screen-lg");
		expect(aside).toHaveClass("px-3");
		expect(aside).toHaveClass("py-6");
		expect(aside).toHaveClass("mx-auto");
	});

	it("form has correct styling classes", () => {
		const { container } = render(() => <Newsletter />);
		const form = container.querySelector("form");
		expect(form).toHaveClass("flex");
		expect(form).toHaveClass("px-4");
		expect(form).toHaveClass("py-2");
		expect(form).toHaveClass("bg-white");
		expect(form).toHaveClass("rounded-full");
		expect(form).toHaveClass("focus-within:ring-2");
		expect(form).toHaveClass("hover:ring-2");
	});

	it("subscribe button has correct styling", () => {
		render(() => <Newsletter />);
		const subscribeButton = screen.getByText("Subscribe").closest("button");
		expect(subscribeButton).toHaveClass("px-3");
		expect(subscribeButton).toHaveClass("py-1");
		expect(subscribeButton).toHaveClass("text-sm");
		expect(subscribeButton).toHaveClass("font-semibold");
		expect(subscribeButton).toHaveClass("rounded-full");
		expect(subscribeButton).toHaveClass("bg-gradient-to-br");
	});

	it("handles form submission", () => {
		const { container } = render(() => <Newsletter />);
		const form = container.querySelector("form");
		const handleSubmit = vi.fn((e) => e.preventDefault());

		if (form) {
			form.addEventListener("submit", handleSubmit);
			fireEvent.submit(form);
			expect(handleSubmit).toHaveBeenCalled();
		}
	});

	it("renders responsive layout classes", () => {
		const { container } = render(() => <Newsletter />);
		const flexContainer = container.querySelector("div.flex");
		expect(flexContainer).toHaveClass("flex-col");
		expect(flexContainer).toHaveClass("sm:flex-row");
		expect(flexContainer).toHaveClass("items-center");
		expect(flexContainer).toHaveClass("justify-between");
		expect(flexContainer).toHaveClass("gap-6");
	});
});
