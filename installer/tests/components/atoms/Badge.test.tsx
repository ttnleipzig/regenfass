import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { Badge } from "@/components/atoms/Badge.tsx";

describe("Badge", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default variant", () => {
    render(() => <Badge>Default Badge</Badge>);
    expect(screen.getByText("Default Badge")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    const { container } = render(() => <Badge>Default</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-primary");
  });

  it("applies secondary variant", () => {
    const { container } = render(() => <Badge variant="secondary">Secondary</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-secondary");
  });

  it("applies destructive variant", () => {
    const { container } = render(() => <Badge variant="destructive">Destructive</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("bg-destructive");
  });

  it("applies outline variant", () => {
    const { container } = render(() => <Badge variant="outline">Outline</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("text-foreground");
  });

  it("merges custom classes correctly", () => {
    const { container } = render(() => <Badge class="custom-class">Custom</Badge>);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("custom-class");
    expect(badge).toHaveClass("bg-primary");
  });

  it("renders children content", () => {
    render(() => <Badge>Test Content</Badge>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("passes through other div attributes", () => {
    const { container } = render(() => (
      <Badge data-testid="badge-test" id="badge-id">
        Test
      </Badge>
    ));
    const badge = container.querySelector("div");
    expect(badge).toHaveAttribute("data-testid", "badge-test");
    expect(badge).toHaveAttribute("id", "badge-id");
  });
});
