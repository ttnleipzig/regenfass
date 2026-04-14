import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import Confetti, {
	CONFETTI_PARTICLE_COUNT,
} from "@/components/atoms/Confetti.tsx";

describe("Confetti", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders fullscreen burst with many colored pieces when active", () => {
		const { container } = render(() => <Confetti active={true} />);
		const root = container.querySelector(".confetti-burst");
		expect(root).toBeInTheDocument();
		expect(root).toHaveClass("fixed", "inset-0");

		const carriers = container.querySelectorAll(".confetti-burst__carrier");
		expect(carriers.length).toBe(CONFETTI_PARTICLE_COUNT);

		const shards = container.querySelectorAll(".confetti-burst__shard");
		expect(shards.length).toBe(CONFETTI_PARTICLE_COUNT);

		const confettiElements = container.querySelectorAll(
			"div[class*='bg-destructive'], div[class*='bg-primary'], div[class*='bg-green-500'], div[class*='bg-yellow-500'], div[class*='bg-purple-500'], div[class*='bg-blue-500'], div[class*='bg-pink-500'], div[class*='bg-orange-500']",
		);
		expect(confettiElements.length).toBe(CONFETTI_PARTICLE_COUNT);
	});

	it("does not render burst when active is false", () => {
		const { container } = render(() => <Confetti active={false} />);
		expect(container.querySelector(".confetti-burst")).not.toBeInTheDocument();
	});

	it("does not render burst when active is undefined", () => {
		const { container } = render(() => <Confetti />);
		expect(container.querySelector(".confetti-burst")).not.toBeInTheDocument();
	});

	it("includes palette variety across particles", () => {
		const { container } = render(() => <Confetti active={true} />);
		const pieces = Array.from(container.querySelectorAll(".confetti-burst__shard"));

		expect(pieces.some((el) => el.className.includes("bg-destructive"))).toBe(true);
		expect(pieces.some((el) => el.className.includes("bg-primary"))).toBe(true);
		expect(pieces.some((el) => el.className.includes("bg-green-500"))).toBe(true);
		expect(pieces.some((el) => el.className.includes("bg-yellow-500"))).toBe(true);
		expect(pieces.some((el) => el.className.includes("bg-purple-500"))).toBe(true);
	});

	it("marks overlay as decorative for assistive tech", () => {
		const { container } = render(() => <Confetti active={true} />);
		const root = container.querySelector(".confetti-burst");
		expect(root).toHaveAttribute("aria-hidden", "true");
		expect(root).toHaveAttribute("role", "presentation");
	});

	it("does not block pointer events", () => {
		const { container } = render(() => <Confetti active={true} />);
		const root = container.querySelector(".confetti-burst");
		expect(root).toHaveClass("pointer-events-none");
	});
});
