import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { ButtonPrimary } from "@/components/atoms/ButtonPrimary.tsx";

describe("ButtonPrimary", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with primary styling", () => {
    render(() => <ButtonPrimary>Primary Button</ButtonPrimary>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Primary Button")).toBeInTheDocument();
  });

  it("applies primary blue styling", () => {
    const { container } = render(() => <ButtonPrimary>Primary</ButtonPrimary>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-blue-600");
    expect(button).toHaveClass("hover:bg-blue-700");
    expect(button).toHaveClass("text-white");
  });

  it("shows loading spinner when loading is true", () => {
    const { container } = render(() => <ButtonPrimary loading>Loading</ButtonPrimary>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    render(() => <ButtonPrimary loading>Loading</ButtonPrimary>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when disabled prop is true", () => {
    render(() => <ButtonPrimary disabled>Disabled</ButtonPrimary>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when both loading and disabled are true", () => {
    render(() => (
      <ButtonPrimary loading disabled>
        Both
      </ButtonPrimary>
    ));
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows spinner with correct styling when loading", () => {
    const { container } = render(() => <ButtonPrimary loading>Loading</ButtonPrimary>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toHaveClass("text-white");
    expect(spinner).toHaveClass("-ml-1");
    expect(spinner).toHaveClass("mr-3");
    expect(spinner).toHaveClass("h-4");
    expect(spinner).toHaveClass("w-4");
  });

  it("renders children when not loading", () => {
    const { container } = render(() => <ButtonPrimary>Click me</ButtonPrimary>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).not.toBeInTheDocument();
  });

  it("merges custom classes", () => {
    const { container } = render(() => <ButtonPrimary class="custom-class">Custom</ButtonPrimary>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(() => <ButtonPrimary onClick={handleClick}>Click me</ButtonPrimary>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not handle clicks when disabled", () => {
    const handleClick = vi.fn();
    render(() => (
      <ButtonPrimary disabled onClick={handleClick}>
        Disabled
      </ButtonPrimary>
    ));
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("passes through other button attributes", () => {
    render(() => (
      <ButtonPrimary type="submit" aria-label="Submit form" data-testid="primary-btn">
        Submit
      </ButtonPrimary>
    ));
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("aria-label", "Submit form");
    expect(button).toHaveAttribute("data-testid", "primary-btn");
  });
});
