import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { FormLayout } from "@/components/forms/FormLayout.tsx";

describe("FormLayout", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders form element", () => {
		const { container } = render(() => <FormLayout>Content</FormLayout>);
		const form = container.querySelector("form");
		expect(form).toBeInTheDocument();
	});

	it("renders children", () => {
		render(() => (
			<FormLayout>
				<input type="text" />
			</FormLayout>
		));
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
	});

	it("renders title when provided", () => {
		render(() => <FormLayout title="Form Title">Content</FormLayout>);
		expect(screen.getByText("Form Title")).toBeInTheDocument();
	});

	it("renders subtitle when provided", () => {
		render(() => (
			<FormLayout title="Form Title" subtitle="Form Subtitle">
				Content
			</FormLayout>
		));
		expect(screen.getByText("Form Subtitle")).toBeInTheDocument();
	});

	it("renders subtitle without title", () => {
		render(() => (
			<FormLayout subtitle="Form Subtitle">Content</FormLayout>
		));
		expect(screen.getByText("Form Subtitle")).toBeInTheDocument();
	});

	it("renders actions when provided", () => {
		render(() => (
			<FormLayout
				actions={
					<>
						<button type="submit">Submit</button>
						<button type="button">Cancel</button>
					</>
				}
			>
				Content
			</FormLayout>
		));
		expect(screen.getByText("Submit")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("applies custom class", () => {
		const { container } = render(() => (
			<FormLayout class="custom-class">Content</FormLayout>
		));
		const form = container.querySelector("form");
		expect(form).toHaveClass("custom-class");
	});

	it("passes through form attributes", () => {
		const { container } = render(() => (
			<FormLayout action="/submit" method="post">
				Content
			</FormLayout>
		));
		const form = container.querySelector("form");
		expect(form).toBeInTheDocument();
		expect(form).toHaveAttribute("action", "/submit");
		expect(form).toHaveAttribute("method", "post");
	});
});
