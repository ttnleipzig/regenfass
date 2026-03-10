import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { ErrorList } from "@/components/molecules/ErrorList.tsx";

describe("ErrorList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when errors array is empty", () => {
    const { container } = render(() => <ErrorList errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when errors prop is undefined", () => {
    const { container } = render(() => <ErrorList />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error list with single error", () => {
    render(() => <ErrorList errors={["Error message"]} />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders error list with multiple errors", () => {
    render(() => (
      <ErrorList errors={["Error 1", "Error 2", "Error 3"]} />
    ));
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.getByText("Error 2")).toBeInTheDocument();
    expect(screen.getByText("Error 3")).toBeInTheDocument();
  });

  it("renders with default title", () => {
    render(() => <ErrorList errors={["Error"]} />);
    expect(screen.getByText("Fehler")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(() => <ErrorList errors={["Error"]} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.queryByText("Fehler")).not.toBeInTheDocument();
  });

  it("has correct role attribute", () => {
    render(() => <ErrorList errors={["Error"]} />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("renders error icon", () => {
    const { container } = render(() => <ErrorList errors={["Error"]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Uses shadcn tokens - check for destructive color classes
    // SVG className is SVGAnimatedString, so use classList or toHaveClass
    expect(svg).toHaveClass("text-destructive");
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => <ErrorList errors={["Error"]} />);
    const errorList = container.querySelector('[role="alert"]');
    // Uses shadcn tokens - check for destructive color classes
    expect(errorList?.className.includes("bg-destructive")).toBeTruthy();
    expect(errorList?.className.includes("border-destructive")).toBeTruthy();
  });

  it("renders errors as list items", () => {
    const { container } = render(() => (
      <ErrorList errors={["Error 1", "Error 2"]} />
    ));
    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(2);
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <ErrorList errors={["Error"]} class="custom-class" />
    ));
    const errorList = container.querySelector('[role="alert"]');
    expect(errorList).toHaveClass("custom-class");
  });

  it("passes through other HTML attributes", () => {
    const { container } = render(() => (
      <ErrorList errors={["Error"]} data-testid="error-list" />
    ));
    const errorList = container.querySelector('[data-testid="error-list"]');
    expect(errorList).toBeInTheDocument();
  });
});
