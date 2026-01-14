import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { ButtonAction } from "@/components/atoms/ButtonAction.tsx";

describe("ButtonAction", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default primary type", () => {
    render(() => <ButtonAction>Primary Action</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Primary Action")).toBeInTheDocument();
  });

  it("applies primary styling by default", () => {
    const { container } = render(() => <ButtonAction>Primary</ButtonAction>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-blue-600");
    expect(button).toHaveClass("text-white");
  });

  it("renders with secondary type", () => {
    render(() => <ButtonAction type="secondary">Secondary Action</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies secondary styling", () => {
    const { container } = render(() => <ButtonAction type="secondary">Secondary</ButtonAction>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-gray-300");
    expect(button).toHaveClass("text-gray-700");
  });

  it("shows loading spinner when loading is true", () => {
    const { container } = render(() => <ButtonAction loading>Loading</ButtonAction>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    render(() => <ButtonAction loading>Loading</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when disabled prop is true", () => {
    render(() => <ButtonAction disabled>Disabled</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables button when both loading and disabled are true", () => {
    render(() => (
      <ButtonAction loading disabled>
        Both
      </ButtonAction>
    ));
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("applies correct spinner color for primary type", () => {
    const { container } = render(() => <ButtonAction loading>Primary Loading</ButtonAction>);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toHaveClass("text-white");
  });

  it("applies correct spinner color for secondary type", () => {
    const { container } = render(() => (
      <ButtonAction type="secondary" loading>
        Secondary Loading
      </ButtonAction>
    ));
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).toHaveClass("text-gray-500");
  });

  it("handles nativeType prop as submit", () => {
    render(() => <ButtonAction nativeType="submit">Submit</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("handles nativeType prop as reset", () => {
    render(() => <ButtonAction nativeType="reset">Reset</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "reset");
  });

  it("defaults to button type when nativeType is not provided", () => {
    render(() => <ButtonAction>Button</ButtonAction>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("merges custom classes", () => {
    const { container } = render(() => <ButtonAction class="custom-class">Custom</ButtonAction>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(() => <ButtonAction onClick={handleClick}>Click me</ButtonAction>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("passes through other button attributes", () => {
    render(() => (
      <ButtonAction aria-label="Action button" data-testid="action-btn">
        Action
      </ButtonAction>
    ));
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Action button");
    expect(button).toHaveAttribute("data-testid", "action-btn");
  });
});
