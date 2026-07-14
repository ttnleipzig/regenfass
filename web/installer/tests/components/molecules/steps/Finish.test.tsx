import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { finishStep } from "@/components/molecules/steps/Finish.tsx";

describe("Finish", () => {
  afterEach(() => {
    cleanup();
  });

  it("has correct step title", () => {
    expect(finishStep.title).toBe("Finish");
  });

  it("renders finish step", () => {
    const Component = finishStep.render;
    render(() => <Component />);
    expect(screen.getByText("Installation Complete")).toBeInTheDocument();
    expect(
      screen.getByText("Thank you for installing our application!")
    ).toBeInTheDocument();
  });

  it("renders step content", () => {
    const Component = finishStep.render;
    const { container } = render(() => <Component />);
    const stepContent = container.querySelector(".space-y-4");
    expect(stepContent).toBeInTheDocument();
  });
});
