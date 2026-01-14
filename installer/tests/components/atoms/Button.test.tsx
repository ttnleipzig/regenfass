import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { Button } from "@/components/atoms/Button.tsx";

describe("Button", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default variant and size", () => {
    render(() => <Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    const { container } = render(() => <Button>Default</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-primary");
  });

  it("applies destructive variant", () => {
    const { container } = render(() => <Button variant="destructive">Delete</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("applies outline variant", () => {
    const { container } = render(() => <Button variant="outline">Outline</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("border");
  });

  it("applies secondary variant", () => {
    const { container } = render(() => <Button variant="secondary">Secondary</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-secondary");
  });

  it("applies ghost variant", () => {
    const { container } = render(() => <Button variant="ghost">Ghost</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("hover:bg-accent");
  });

  it("applies link variant", () => {
    const { container } = render(() => <Button variant="link">Link</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("underline-offset-4");
  });

  it("applies small size", () => {
    const { container } = render(() => <Button size="sm">Small</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("h-8");
    expect(button).toHaveClass("text-xs");
  });

  it("applies large size", () => {
    const { container } = render(() => <Button size="lg">Large</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("h-10");
  });

  it("applies icon size", () => {
    const { container } = render(() => <Button size="icon">Icon</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("h-9");
    expect(button).toHaveClass("w-9");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("merges custom classes", () => {
    const { container } = render(() => <Button class="custom-class">Custom</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-primary");
  });

  it("disables button when disabled prop is true", () => {
    render(() => <Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("applies disabled styles", () => {
    const { container } = render(() => <Button disabled>Disabled</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("can render as different element types", () => {
    const { container } = render(() => <Button as="a" href="/test">Link Button</Button>);
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("passes through other button attributes", () => {
    render(() => (
      <Button type="submit" aria-label="Submit form" data-testid="submit-btn">
        Submit
      </Button>
    ));
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("aria-label", "Submit form");
    expect(button).toHaveAttribute("data-testid", "submit-btn");
  });
});
