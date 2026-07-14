import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { Header } from "@regenfass/brand";

// Mock useColorMode hook
vi.mock("@kobalte/core/color-mode", async () => {
	const { createSignal } = await import("solid-js");
	return {
		useColorMode: () => {
			const [colorMode, setColorMode] = createSignal<"light" | "dark">("light");
			return {
				colorMode,
				setColorMode: (mode: "light" | "dark") => {
					setColorMode(mode);
				},
			};
		},
	};
});

describe("Header", () => {
	afterEach(() => {
		cleanup();
	});

	const renderWithRouter = (component: any) => {
		const TestComponent = () => component;
		return render(() => (
			<Router>
				<Route path="/*" component={TestComponent} />
			</Router>
		));
	};

	it("renders header element", () => {
		const { container } = renderWithRouter(() => <Header />);
		const header = container.querySelector("header");
		expect(header).toBeInTheDocument();
	});

	it("renders Regenfass title", () => {
		renderWithRouter(() => <Header />);
		const title = screen.getByText("Regenfass");
		expect(title).toBeInTheDocument();
		expect(title.tagName).toBe("H1");
	});

	it("renders default navigation links", () => {
		renderWithRouter(() => <Header />);
		const componentsLink = screen.getByText(/Components/);
		expect(componentsLink).toBeInTheDocument();
		expect(componentsLink.closest("a")).toHaveAttribute(
			"href",
			"https://brand.regenfass.eu",
		);

		const docsLink = screen.getByText("Docs");
		expect(docsLink).toBeInTheDocument();
		expect(docsLink.closest("a")).toHaveAttribute(
			"href",
			"https://docs.regenfass.eu/",
		);

		const installerLink = screen.getByText("Installer");
		expect(installerLink).toBeInTheDocument();
		expect(installerLink.closest("a")).toHaveAttribute(
			"href",
			"https://install.regenfass.eu",
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

	it("accepts custom navItems", () => {
		renderWithRouter(() => (
			<Header
				navItems={[{ href: "/gallery", label: "Gallery" }]}
			/>
		));
		const gallery = screen.getByText("Gallery");
		expect(gallery.closest("a")).toHaveAttribute("href", "/gallery");
		expect(screen.queryByText("Docs")).not.toBeInTheDocument();
	});

	it("renders ButtonModeToggle", () => {
		renderWithRouter(() => <Header />);
		const toggleButton = screen.getByLabelText("Toggle color mode");
		expect(toggleButton).toBeInTheDocument();
	});

	it("does not render ButtonSoundToggle", () => {
		renderWithRouter(() => <Header />);
		expect(screen.queryByLabelText("Mute sounds")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Unmute sounds")).not.toBeInTheDocument();
	});

	it("applies correct container classes", () => {
		const { container } = renderWithRouter(() => <Header />);
		const header = container.querySelector("header");
		expect(header).toHaveClass("w-full");
		expect(header).toHaveClass("py-6");

		const innerDiv = container.querySelector(".site-container");
		expect(innerDiv).toHaveClass("site-container");
		expect(innerDiv).toHaveClass("flex");
		expect(innerDiv).toHaveClass("justify-between");
		expect(innerDiv).toHaveClass("items-center");
	});

	it("applies gradient text to title", () => {
		const { container } = renderWithRouter(() => <Header />);
		const title = container.querySelector("h1");
		expect(title).toHaveClass("text-transparent");
		expect(title).toHaveClass("bg-gradient-to-br");
		expect(title).toHaveClass("bg-clip-text");
	});

	it("hides navigation on mobile", () => {
		const { container } = renderWithRouter(() => <Header />);
		const nav = container.querySelector("nav");
		expect(nav).toHaveClass("hidden");
		expect(nav).toHaveClass("md:block");
	});
});
