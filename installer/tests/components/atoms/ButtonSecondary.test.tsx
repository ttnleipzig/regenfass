import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { ButtonSecondary } from "@/components/atoms/ButtonSecondary.tsx";

describe("ButtonSecondary", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with secondary/outline styling", () => {
    render(() => <ButtonSecondary>Secondary Button</ButtonSecondary>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Secondary Button")).toBeInTheDocument();
  });

  it("applies secondary gray styling", () => {
    const { container } = render(() => <ButtonSecondary>Secondary</ButtonSecondary>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-gray-300");
    expect(button).toHaveClass("text-gray-700");
    expect(button).toHaveClass("hover:bg-gray-50");
  });

  it("applies outline variant", () => {
    const { container } = render(() => <ButtonSecondary>Secondary</ButtonSecondary>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("border");
  });

  it("shows loading spinner when loading is true", () => {
    const { container } = render(() => <ButtonSecondary loading>Loading</ButtonSecondary>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    render(() => <ButtonSecondary loading>Loading</ButtonSecondary>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when disabled prop is true", () => {
    render(() => <ButtonSecondary disabled>Disabled</ButtonSecondary>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when both loading and disabled are true", () => {
    render(() => (
      <ButtonSecondary loading disabled>
        Both
      </ButtonSecondary>
    ));
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows spinner with correct styling when loading", () => {
    const { container } = render(() => <ButtonSecondary loading>Loading</ButtonSecondary>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toHaveClass("text-gray-500");
    expect(spinner).toHaveClass("-ml-1");
    expect(spinner).toHaveClass("mr-3");
    expect(spinner).toHaveClass("size-3");
  });

  it("renders children when not loading", () => {
    const { container } = render(() => <ButtonSecondary>Click me</ButtonSecondary>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).not.toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => <ButtonSecondary class="custom-class">Custom</ButtonSecondary>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("border-gray-300");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(() => <ButtonSecondary onClick={handleClick}>Click me</ButtonSecondary>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not handle clicks when disabled", () => {
    const handleClick = vi.fn();
    render(() => (
      <ButtonSecondary disabled onClick={handleClick}>
        Disabled
      </ButtonSecondary>
    ));
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("passes through other button attributes", () => {
    render(() => (
      <ButtonSecondary type="button" aria-label="Cancel action" data-testid="secondary-btn">
        Cancel
      </ButtonSecondary>
    ));
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", "Cancel action");
    expect(button).toHaveAttribute("data-testid", "secondary-btn");
  });
});
