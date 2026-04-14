import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { StepPaginator } from "@/components/molecules/StepPaginator.tsx";

describe("StepPaginator", () => {
  afterEach(() => {
    cleanup();
  });

  const steps = ["First step", "Second step", "Third step"] as const;

  it("renders title when provided", () => {
    render(() => (
      <StepPaginator title="How it works" steps={steps} />
    ));
    expect(screen.getByText("How it works")).toBeInTheDocument();
  });

  it("renders all step labels", () => {
    render(() => <StepPaginator steps={steps} />);
    for (const label of steps) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("sets aria-label on the list", () => {
    render(() => (
      <StepPaginator steps={steps} listAriaLabel="Setup checklist" />
    ));
    expect(screen.getByRole("list", { name: "Setup checklist" })).toBeInTheDocument();
  });

  it("uses compact horizontal layout classes when variant is compact", () => {
    const { container } = render(() => (
      <StepPaginator steps={steps} variant="compact" />
    ));
    const list = container.querySelector("ol");
    expect(list?.className).toContain("flex-row");
    expect(list?.className).toContain("flex-wrap");
  });

  it("highlights the active step when activeStep is set", () => {
    const { container } = render(() => (
      <StepPaginator steps={steps} activeStep={2} />
    ));
    const badges = container.querySelectorAll("ol > li > span[aria-hidden='true']");
    expect(badges.length).toBe(3);
    expect(badges[1]?.className).toContain("bg-primary");
    expect(badges[1]?.className).toContain("text-primary-foreground");
    expect(badges[0]?.className).toContain("bg-muted");
  });
});
