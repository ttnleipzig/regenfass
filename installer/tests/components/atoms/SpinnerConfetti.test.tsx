import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import SpinnerConfetti from "@/components/atoms/SpinnerConfetti.tsx";

describe("SpinnerConfetti", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders spinner element", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const spinner = container.querySelector("svg.animate-spin");
		expect(spinner).toBeInTheDocument();
	});

	it("renders four confetti shards around the spinner", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const shards = container.querySelectorAll(".spinner-confetti__shard");
		expect(shards.length).toBe(4);

		const shardArray = Array.from(shards);
		const hasRed = shardArray.some((el) => el.className.includes("bg-red-500"));
		const hasBlue = shardArray.some((el) => el.className.includes("bg-blue-500"));
		const hasGreen = shardArray.some((el) => el.className.includes("bg-green-500"));
		const hasYellow = shardArray.some((el) =>
			el.className.includes("bg-yellow-500"),
		);

		expect(hasRed).toBe(true);
		expect(hasBlue).toBe(true);
		expect(hasGreen).toBe(true);
		expect(hasYellow).toBe(true);
	});

	it("has correct spinner structure", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const spinner = container.querySelector("svg.animate-spin");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveClass("size-6");
		expect(spinner).toHaveClass("text-primary");
		expect(spinner).toHaveClass("spinner-confetti__spinner");
	});

	it("has correct container structure", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const mainContainer = container.querySelector("div.flex");
		expect(mainContainer).toBeInTheDocument();
		expect(mainContainer).toHaveClass("items-center");
		expect(mainContainer).toHaveClass("justify-center");
		expect(mainContainer).toHaveClass("w-32");
		expect(mainContainer).toHaveClass("h-32");
	});

	it("has orbit wrappers for each confetti piece", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const orbits = container.querySelectorAll(".spinner-confetti__orbit");
		expect(orbits.length).toBe(4);
	});

	it("has absolute ring for confetti positioning", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const ring = container.querySelector(".spinner-confetti__ring.absolute.inset-0");
		expect(ring).toBeInTheDocument();
	});

	it("marks decorative confetti as hidden from assistive tech", () => {
		const { container } = render(() => <SpinnerConfetti />);
		const ring = container.querySelector(".spinner-confetti__ring");
		expect(ring).toHaveAttribute("aria-hidden", "true");
	});
});
