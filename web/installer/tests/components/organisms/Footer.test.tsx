import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Footer } from "@regenfass/brand";

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
		const { container } = render(() => <Footer />);
		const address = container.querySelector("address");
		expect(address).toBeInTheDocument();
		expect(address).toHaveTextContent("TTN Leipzig");
		expect(address).toHaveTextContent("Hardenbergstraße 48");
	});

	it("credits the TTN Leipzig user group", () => {
		render(() => <Footer />);
		const projectLink = screen.getByRole("link", { name: "TTN Leipzig user group" });
		expect(projectLink).toHaveAttribute("href", "https://ttn-leipzig.de");
		expect(projectLink).toHaveAttribute("target", "_blank");
		expect(projectLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("does not render the former ESP Web Tools credit", () => {
		render(() => <Footer />);
		expect(screen.queryByText("ESP Web Tools")).not.toBeInTheDocument();
		expect(screen.queryByText(/Powered by/)).not.toBeInTheDocument();
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
		expect(footer).toHaveClass("site-container");
		expect(footer).toHaveClass("py-8");
	});

	it("renders navigation icons", () => {
		const { container } = render(() => <Footer />);
		const svgIcons = container.querySelectorAll("svg");
		expect(svgIcons.length).toBeGreaterThan(0);
	});

	it("renders shared product version and release notes link", () => {
		render(() => <Footer />);
		expect(screen.getByText(/^v\d+\.\d+\.\d+/)).toBeInTheDocument();
		const releaseLink = screen.getByText("Release notes");
		expect(releaseLink.closest("a")).toHaveAttribute(
			"href",
			"https://github.com/ttnleipzig/regenfass/releases",
		);
	});
});
