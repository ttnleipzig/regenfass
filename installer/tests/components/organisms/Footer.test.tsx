import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import Footer from "@/components/organisms/Footer.tsx";

describe("Footer", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders footer element", () => {
		const { container } = render(() => <Footer />);
		const footer = container.querySelector("footer");
		expect(footer).toBeInTheDocument();
	});

	it("renders address information", () => {
		render(() => <Footer />);
		expect(screen.getByText(/TTN Leipzig/)).toBeInTheDocument();
		expect(screen.getByText(/Hardenbergstraße 48/)).toBeInTheDocument();
	});

	it("renders powered by link", () => {
		render(() => <Footer />);
		const poweredByLink = screen.getByText(/Powered by/);
		expect(poweredByLink).toBeInTheDocument();
		const espLink = screen.getByText("ESP Web Tools");
		expect(espLink).toBeInTheDocument();
		expect(espLink.closest("a")).toHaveAttribute(
			"href",
			"https://esphome.github.io/esp-web-tools/",
		);
		expect(espLink.closest("a")).toHaveAttribute("target", "_blank");
		expect(espLink.closest("a")).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("renders mobile navigation links", () => {
		render(() => <Footer />);
		const docsLink = screen.getByText("Docs");
		expect(docsLink).toBeInTheDocument();
		expect(docsLink.closest("a")).toHaveAttribute(
			"href",
			"https://docs.regenfass.eu/",
		);

		const githubLink = screen.getByText("GitHub");
		expect(githubLink).toBeInTheDocument();
		expect(githubLink.closest("a")).toHaveAttribute(
			"href",
			"https://github.com/ttnleipzig/regenfass",
		);

		const matrixLink = screen.getByText("Matrix");
		expect(matrixLink).toBeInTheDocument();
		expect(matrixLink.closest("a")).toHaveAttribute(
			"href",
			"https://matrix.to/#/#ttn-leipzig:matrix.org",
		);
	});

	it("applies correct container classes", () => {
		const { container } = render(() => <Footer />);
		const footer = container.querySelector("footer");
		expect(footer).toHaveClass("max-w-screen-lg");
		expect(footer).toHaveClass("px-3");
		expect(footer).toHaveClass("py-6");
		expect(footer).toHaveClass("mx-auto");
	});

	it("renders navigation icons", () => {
		const { container } = render(() => <Footer />);
		const svgIcons = container.querySelectorAll("svg");
		expect(svgIcons.length).toBeGreaterThan(0);
	});
});
