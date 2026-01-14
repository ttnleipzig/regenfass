import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import Confetti from "@/components/atoms/Confetti.tsx";

describe("Confetti", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders confetti elements when active is true", () => {
    const { container } = render(() => <Confetti active={true} />);
    // Confetti elements have bg-* classes
    const confettiElements = container.querySelectorAll("div[class*='bg-red-500'], div[class*='bg-blue-500'], div[class*='bg-green-500'], div[class*='bg-yellow-500'], div[class*='bg-purple-500']");
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it("does not render confetti when active is false", () => {
    const { container } = render(() => <Confetti active={false} />);
    const confettiElements = container.querySelectorAll("div[class*='bg-red-500'], div[class*='bg-blue-500'], div[class*='bg-green-500'], div[class*='bg-yellow-500'], div[class*='bg-purple-500']");
    expect(confettiElements.length).toBe(0);
  });

  it("does not render confetti when active is undefined", () => {
    const { container } = render(() => <Confetti />);
    const confettiElements = container.querySelectorAll("div[class*='bg-red-500'], div[class*='bg-blue-500'], div[class*='bg-green-500'], div[class*='bg-yellow-500'], div[class*='bg-purple-500']");
    expect(confettiElements.length).toBe(0);
  });

  it("shows correct status text when active", () => {
    render(() => <Confetti active={true} />);
    expect(screen.getByText(/confetti.*aktiv/i)).toBeInTheDocument();
  });

  it("shows correct status text when inactive", () => {
    render(() => <Confetti active={false} />);
    expect(screen.getByText(/confetti.*inaktiv/i)).toBeInTheDocument();
  });

  it("renders multiple confetti elements with different colors", () => {
    const { container } = render(() => <Confetti active={true} />);
    
    // All confetti elements have animate-bounce class, so find them first
    const allConfetti = container.querySelectorAll("div.animate-bounce");
    expect(allConfetti.length).toBe(5);
    
    // Verify individual colors exist by checking class names
    const confettiArray = Array.from(allConfetti);
    const hasRed = confettiArray.some(el => el.className.includes("bg-red-500"));
    const hasBlue = confettiArray.some(el => el.className.includes("bg-blue-500"));
    const hasGreen = confettiArray.some(el => el.className.includes("bg-green-500"));
    const hasYellow = confettiArray.some(el => el.className.includes("bg-yellow-500"));
    const hasPurple = confettiArray.some(el => el.className.includes("bg-purple-500"));
    
    expect(hasRed).toBe(true);
    expect(hasBlue).toBe(true);
    expect(hasGreen).toBe(true);
    expect(hasYellow).toBe(true);
    expect(hasPurple).toBe(true);
  });

  it("applies correct animation classes to confetti elements", () => {
    const { container } = render(() => <Confetti active={true} />);
    const confettiElements = container.querySelectorAll("div.animate-bounce");
    expect(confettiElements.length).toBeGreaterThan(0);
  });

  it("has correct container structure", () => {
    const { container } = render(() => <Confetti active={true} />);
    const mainContainer = container.querySelector("div.relative");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("w-48");
    expect(mainContainer).toHaveClass("h-48");
  });

  it("renders status text container", () => {
    const { container } = render(() => <Confetti active={true} />);
    const textContainer = container.querySelector("div.text-center");
    expect(textContainer).toBeInTheDocument();
    expect(textContainer).toHaveClass("mt-32");
  });
});
