import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { LocaleProvider, Newsletter } from "@regenfass/brand";

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
			"https://regenfass.eu/.netlify/functions/newsletter-subscribe",
		);
	});

	it("renders the required listmonk subscription fields", () => {
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
		expect(container.querySelector('input[name="name"]')).not.toBeInTheDocument();
		expect(container.querySelector('input[name="l"]')).not.toBeInTheDocument();
		expect(container.querySelector('input[name="language"]')).toHaveValue("en");
	});

	it("sends the selected locale and shows the confirmation", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), { status: 200 }),
		);
		render(() => (
			<LocaleProvider initialLocale="de">
				<Newsletter endpoint="https://example.test/subscribe" />
			</LocaleProvider>
		));

		const form = document.querySelector("form#form-newsletter") as HTMLFormElement;
		const email = form.querySelector('input[name="email"]') as HTMLInputElement;
		email.value = "test@example.com";
		await fireEvent.submit(form);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://example.test/subscribe",
			expect.objectContaining({ method: "POST" }),
		);
		const request = fetchMock.mock.calls[0]?.[1];
		expect((request?.body as FormData).get("language")).toBe("de");
		expect(await screen.findByRole("status")).toHaveTextContent("Fast fertig");
		fetchMock.mockRestore();
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
		const form = container.querySelector("form#form-newsletter");

		expect(flexContainer).toHaveClass("flex-col");
		expect(flexContainer).toHaveClass("gap-6");
		expect(form).toHaveClass("flex-col");
		expect(form).toHaveClass("sm:flex-row");
		expect(form).toHaveClass("sm:items-center");
	});
});
