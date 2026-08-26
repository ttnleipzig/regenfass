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

	it("renders regenfass title", () => {
		const { container } = renderWithRouter(() => <Header />);
		const title = container.querySelector("h1");
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent("regenfass");
	});

	it("marks the wordmark as an alpha version", () => {
		const { container } = renderWithRouter(() => <Header />);
		const badge = container.querySelector('[data-version-badge="alpha"]');

		expect(badge).toHaveTextContent("ALPHA");
		expect(badge).toHaveAttribute("role", "status");
		expect(badge?.closest("button")).toHaveClass("absolute", "bottom-1", "right-0", "cursor-help");
	});

	it("connects the alpha badge to an accessible beta tester tooltip", () => {
		const { container } = renderWithRouter(() => <Header />);
		const badge = container.querySelector('[data-version-badge="alpha"]');
		const badgeLink = badge?.closest("button");
		const tooltip = container.querySelector('[role="tooltip"]');

		expect(badgeLink).toHaveAttribute("aria-describedby", "alpha-tooltip");
		expect(badgeLink).toHaveAttribute("aria-label", "Alpha version");
		expect(badgeLink).toHaveAttribute("aria-expanded", "false");
		expect(tooltip).toHaveTextContent("early stage of development");
		expect(tooltip).toHaveClass("left-0");
		expect(tooltip).not.toHaveClass("right-0");
		expect(tooltip?.querySelector("a")).toHaveAttribute("href", "http://localhost:5175/en/beta-testers");
	});

	it("renders an optional white title suffix", () => {
		const { container } = renderWithRouter(() => (
			<Header title="regenfass" titleSuffix="Playground" />
		));
		const suffix = screen.getByText("Playground");

		expect(suffix).toHaveClass("text-foreground/80");
		expect(suffix).toHaveClass("dark:text-white");
		expect(suffix).toHaveClass("font-normal");
		expect(container.querySelector("h1")).toHaveTextContent(/regenfass.*ALPHA.*Playground/);
	});

	it("renders default navigation links", () => {
		renderWithRouter(() => <Header />);
		const homeLink = screen.getByText("Home");
		expect(homeLink).toBeInTheDocument();
		expect(homeLink.closest("a")).toHaveAttribute(
			"href",
			"https://regenfass.eu/",
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

		expect(screen.queryByText("Brand")).not.toBeInTheDocument();
	});

	it("renders nested navigation items and marks the current route active", () => {
		renderWithRouter(() => (
			<Header
				navItems={[
					{
						href: "/",
						label: "Home",
						children: [{ href: "/changelog", label: "Changelog" }],
					},
				]}
			/>
		));

		const homeLink = screen.getByText("Home");
		expect(homeLink.closest("a")).toHaveAttribute("aria-current", "page");
		expect(screen.getByText("Changelog")).toBeInTheDocument();
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

	it("renders ButtonToggleMode", () => {
		renderWithRouter(() => <Header />);
		const toggleButton = screen.getByLabelText("Toggle color mode");
		expect(toggleButton).toBeInTheDocument();
	});

	it("does not render ButtonToggleSound", () => {
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

	it("stretches the container when fullWidth is enabled", () => {
		const { container } = renderWithRouter(() => <Header fullWidth />);
		const innerDiv = container.querySelector(".site-container");

		expect(innerDiv).toHaveClass("max-w-none");
	});

	it("supports left-aligned navigation", () => {
		const { container } = renderWithRouter(() => <Header navPosition="left" />);
		const innerDiv = container.querySelector(".site-container");
		const nav = container.querySelector("nav");
		const controls = nav?.nextElementSibling;

		expect(innerDiv).toHaveClass("justify-start");
		expect(nav).toHaveClass("ml-8");
		expect(controls).toHaveClass("ml-auto");
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
