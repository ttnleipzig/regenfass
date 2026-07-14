/// <reference types="vitest/config" />
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import StepFinishShowingError from "@/components/molecules/steps/StepFinishShowingError.tsx";

describe("StepFinishShowingError", () => {
  const mockError = new Error("Test error");
  mockError.stack = "Error: Test error\n    at test.js:1:1";
  mockError.cause = { code: "TEST_ERROR" };

  const mockState = {
    context: {
      error: mockError,
    },
  };
  const mockEmitEvent = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders alert with title", () => {
    render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText("Critical error")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it("renders error stack trace", () => {
    render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
  });

  it("renders error cause", () => {
    render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByText(/"code":"TEST_ERROR"/)).toBeInTheDocument();
  });

  it("uses destructive variant for alert", () => {
    const { container } = render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    // The destructive variant uses border-destructive/30, so check if it contains border-destructive
    expect(alert?.className).toContain("border-destructive");
  });

  it("renders restart button", () => {
    render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    expect(screen.getByRole("button", { name: "Restart" })).toBeInTheDocument();
  });

  it("calls emitEvent when restart button is clicked", () => {
    render(() => (
      <StepFinishShowingError state={mockState} emitEvent={mockEmitEvent} />
    ));
    const button = screen.getByRole("button", { name: "Restart" });
    fireEvent.click(button);
    expect(mockEmitEvent).toHaveBeenCalledWith({ type: "restart" });
  });

  it("handles error without stack trace", () => {
    const errorWithoutStack = new Error("Simple error");
    const stateWithoutStack = {
      context: {
        error: errorWithoutStack,
      },
    };
    render(() => (
      <StepFinishShowingError
        state={stateWithoutStack}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText(/Simple error/)).toBeInTheDocument();
  });

  it("handles error without cause", () => {
    const errorWithoutCause = new Error("Error without cause");
    errorWithoutCause.stack = "Error: Error without cause";
    const stateWithoutCause = {
      context: {
        error: errorWithoutCause,
      },
    };
    render(() => (
      <StepFinishShowingError
        state={stateWithoutCause}
        emitEvent={mockEmitEvent}
      />
    ));
    expect(screen.getByText(/Error without cause/)).toBeInTheDocument();
  });
});
