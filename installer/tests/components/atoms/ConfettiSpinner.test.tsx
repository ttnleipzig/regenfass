import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import ConfettiSpinner from "@/components/atoms/ConfettiSpinner.tsx";

describe("ConfettiSpinner", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders spinner element", () => {
    const { container } = render(() => <ConfettiSpinner />);
    // Spinner is now an SVG element (LoaderCircle) with animate-spin class
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders confetti elements around spinner", () => {
    const { container } = render(() => <ConfettiSpinner />);
    
    // All confetti elements have animate-bounce class
    const allConfetti = container.querySelectorAll("div.animate-bounce");
    expect(allConfetti.length).toBe(4);
    
    // Verify individual colors exist by checking class names
    const confettiArray = Array.from(allConfetti);
    const hasRed = confettiArray.some(el => el.className.includes("bg-red-500"));
    const hasBlue = confettiArray.some(el => el.className.includes("bg-blue-500"));
    const hasGreen = confettiArray.some(el => el.className.includes("bg-green-500"));
    const hasYellow = confettiArray.some(el => el.className.includes("bg-yellow-500"));
    
    expect(hasRed).toBe(true);
    expect(hasBlue).toBe(true);
    expect(hasGreen).toBe(true);
    expect(hasYellow).toBe(true);
  });

  it("has correct spinner structure", () => {
    const { container } = render(() => <ConfettiSpinner />);
    // Spinner is now LoaderCircle SVG with size-lg (size-6)
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("size-6");
    expect(spinner).toHaveClass("text-primary");
  });

  it("has correct container structure", () => {
    const { container } = render(() => <ConfettiSpinner />);
    const mainContainer = container.querySelector("div.flex");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("items-center");
    expect(mainContainer).toHaveClass("justify-center");
    expect(mainContainer).toHaveClass("w-32");
    expect(mainContainer).toHaveClass("h-32");
  });

  it("has relative positioning for confetti container", () => {
    const { container } = render(() => <ConfettiSpinner />);
    const relativeContainer = container.querySelector("div.relative");
    expect(relativeContainer).toBeInTheDocument();
  });

  it("has absolute positioning for confetti elements", () => {
    const { container } = render(() => <ConfettiSpinner />);
    const absoluteContainer = container.querySelector("div.absolute.inset-0");
    expect(absoluteContainer).toBeInTheDocument();
  });

  it("applies animation classes to confetti elements", () => {
    const { container } = render(() => <ConfettiSpinner />);
    const confettiElements = container.querySelectorAll("div.animate-bounce");
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it("applies correct opacity to confetti elements", () => {
    const { container } = render(() => <ConfettiSpinner />);
    const confettiElements = container.querySelectorAll("div[class*='opacity-60']");
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it("has correct confetti element sizes", () => {
    const { container } = render(() => <ConfettiSpinner />);
    const confettiElements = container.querySelectorAll("div[class*='w-2'], div[class*='h-4']");
    expect(confettiElements.length).toBeGreaterThan(0);
  });
});
