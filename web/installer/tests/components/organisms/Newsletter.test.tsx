import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Newsletter } from "@regenfass/brand";

describe("Newsletter", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders newsletter section", () => {
		const { container } = render(() => <Newsletter />);
		expect(container.querySelector("aside#newsletter")).toBeInTheDocument();
	});

	it("renders the translated newsletter content", () => {
		render(() => <Newsletter />);
		expect(screen.getByText(/Subscribe to the/)).toBeInTheDocument();
		expect(screen.getByText(/update newsletters/)).toBeInTheDocument();
		expect(
			screen.getByText(
				/If you would like to be informed about software updates/,
			),
		).toBeInTheDocument();
	});

	it("renders the listmonk form configuration", () => {
		const { container } = render(() => <Newsletter />);
		const form = container.querySelector("form#form-newsletter");

		expect(form).toBeInTheDocument();
		expect(form).toHaveClass("listmonk-form");
		expect(form).toHaveAttribute("method", "post");
		expect(form).toHaveAttribute(
			"action",
			"https://news.regenfass.eu/subscription/form",
		);
	});

	it("renders all listmonk subscription fields", () => {
		const { container } = render(() => <Newsletter />);

		expect(container.querySelector('input[name="nonce"]')).toHaveAttribute(
			"type",
			"hidden",
		);
		expect(container.querySelector('input[name="email"]')).toHaveAttribute(
			"type",
			"email",
		);
		expect(container.querySelector('input[name="email"]')).toBeRequired();
		expect(container.querySelector('input[name="name"]')).toHaveAttribute(
			"type",
			"text",
		);

		const listInput = container.querySelector('input[name="l"]');
		expect(listInput).toHaveAttribute(
			"value",
			"a5bca2e4-c654-4a74-ae01-bf83de6f5623",
		);
		expect(listInput).toBeChecked();
		expect(screen.getByText("Regenfass News")).toBeInTheDocument();
	});

	it("renders a native submit control", () => {
		render(() => <Newsletter />);
		expect(screen.getByText("Subscribe").closest("button")).toHaveAttribute(
			"type",
			"submit",
		);
	});

	it("keeps the responsive newsletter layout", () => {
		const { container } = render(() => <Newsletter />);
		const flexContainer = container.querySelector("div.flex");

		expect(flexContainer).toHaveClass("flex-col");
		expect(flexContainer).toHaveClass("gap-6");
	});
});
