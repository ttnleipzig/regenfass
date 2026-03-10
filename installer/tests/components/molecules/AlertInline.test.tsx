import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { AlertInline, AlertTitle, AlertDescription } from "@/components/molecules/AlertInline.tsx";

describe("AlertInline", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default variant", () => {
    render(() => <AlertInline>Default alert</AlertInline>);
    expect(screen.getByText("Default alert")).toBeInTheDocument();
  });

  it("applies destructive variant", () => {
    const { container } = render(() => (
      <AlertInline variant="destructive">Error message</AlertInline>
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    // The destructive variant uses border-destructive/30, so check if it contains border-destructive
    expect(alert?.className).toContain("border-destructive");
  });

  it("applies warning variant", () => {
    const { container } = render(() => (
      <AlertInline variant="warning">Warning message</AlertInline>
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    // The warning variant uses border-warning/30, so check if it contains border-warning
    expect(alert?.className).toContain("border-warning");
  });

  it("applies info variant", () => {
    const { container } = render(() => (
      <AlertInline variant="info">Info message</AlertInline>
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    // The info variant uses border-info/30, so check if it contains border-info
    expect(alert?.className).toContain("border-info");
  });

  it("shows icon by default", () => {
    const { container } = render(() => (
      <AlertInline variant="destructive">Error</AlertInline>
    ));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("hides icon when showIcon is false", () => {
    const { container } = render(() => (
      <AlertInline variant="destructive" showIcon={false}>
        Error
      </AlertInline>
    ));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertInline class="custom-class">Alert</AlertInline>
    ));
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass("custom-class");
  });

  it("renders with AlertTitle and AlertDescription", () => {
    render(() => (
      <AlertInline>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </AlertInline>
    ));
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(() => <AlertInline>Test content</AlertInline>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });
});

describe("AlertTitle", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title text", () => {
    render(() => <AlertTitle>Alert Title</AlertTitle>);
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => <AlertTitle>Title</AlertTitle>);
    const title = container.querySelector("div");
    expect(title).toHaveClass("font-medium");
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertTitle class="custom-class">Title</AlertTitle>
    ));
    const title = container.querySelector("div");
    expect(title).toHaveClass("custom-class");
  });
});

describe("AlertDescription", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders description text", () => {
    render(() => <AlertDescription>Alert Description</AlertDescription>);
    expect(screen.getByText("Alert Description")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(() => <AlertDescription>Description</AlertDescription>);
    const desc = container.querySelector("div");
    expect(desc).toHaveClass("text-sm");
  });

  it("merges custom classes", () => {
    const { container } = render(() => (
      <AlertDescription class="custom-class">Description</AlertDescription>
    ));
    const desc = container.querySelector("div");
    expect(desc).toHaveClass("custom-class");
  });
});
