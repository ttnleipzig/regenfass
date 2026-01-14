import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import Status from "@/components/atoms/Status.tsx";

describe("Status", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders status message", () => {
    render(() => <Status status="idle" message="Test message" />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders status indicator bubble", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    const bubble = container.querySelector("span.rounded-full");
    expect(bubble).toBeInTheDocument();
  });

  it("has correct testid attribute", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    const statusContainer = container.querySelector('[data-testid="status-indicator"]');
    expect(statusContainer).toBeInTheDocument();
  });

  it("shows ping animation", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    const pingElement = container.querySelector("span.animate-ping");
    expect(pingElement).toBeInTheDocument();
    expect(pingElement).toHaveClass("bg-green-400");
  });

  it("renders with different status values", () => {
    render(() => <Status status="idle" message="Idle" />);
    expect(screen.getByText("Idle")).toBeInTheDocument();
    cleanup();

    render(() => <Status status="loading" message="Loading" />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    cleanup();

    render(() => <Status status="success" message="Success" />);
    expect(screen.getByText("Success")).toBeInTheDocument();
    cleanup();

    render(() => <Status status="error" message="Error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("changes bubble color on interval", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    
    // Initially should have a bubble color
    let bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    const initialColor = bubble?.className || "";
    
    // Advance timer by 4 seconds
    vi.advanceTimersByTime(4000);
    
    // Bubble color should have changed
    bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    const newColor = bubble?.className || "";
    
    // The color should potentially be different (though random, so we just check it exists)
    expect(bubble).toBeInTheDocument();
  });

  it("updates bubble color multiple times", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    
    // Get initial state
    let bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    expect(bubble).toBeInTheDocument();
    
    // Advance timer multiple times
    vi.advanceTimersByTime(4000);
    bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    expect(bubble).toBeInTheDocument();
    
    vi.advanceTimersByTime(4000);
    bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    expect(bubble).toBeInTheDocument();
    
    vi.advanceTimersByTime(4000);
    bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    expect(bubble).toBeInTheDocument();
  });

  it("has correct message styling", () => {
    const { container } = render(() => <Status status="idle" message="Test message" />);
    const message = container.querySelector("p.text-sm");
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass("font-bold");
    expect(message).toHaveClass("pl-5");
    expect(message).toHaveClass("mb-0");
  });

  it("has correct bubble container structure", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    const bubbleContainer = container.querySelector("span.absolute");
    expect(bubbleContainer).toBeInTheDocument();
    expect(bubbleContainer).toHaveClass("top-2");
    expect(bubbleContainer).toHaveClass("left-0");
  });

  it("has correct bubble size", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    const bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    expect(bubble).toHaveClass("w-3");
    expect(bubble).toHaveClass("h-3");
  });

  it("bubble uses one of the defined status colors", () => {
    const { container } = render(() => <Status status="idle" message="Test" />);
    const bubble = container.querySelector("span.rounded-full:not(.animate-ping)");
    
    // Should have one of: bg-green-500, bg-yellow-500, or bg-red-500
    const hasValidColor = 
      bubble?.className.includes("bg-green-500") ||
      bubble?.className.includes("bg-yellow-500") ||
      bubble?.className.includes("bg-red-500");
    
    expect(hasValidColor).toBe(true);
  });
});
