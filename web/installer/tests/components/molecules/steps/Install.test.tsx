import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { installStep } from "@/components/molecules/steps/Install.tsx";

describe("Install", () => {
  afterEach(() => {
    cleanup();
  });

  it("has correct step title", () => {
    expect(installStep.title).toBe("Install");
  });

  it("renders install step", () => {
    const Component = installStep.render;
    render(() => <Component />);
    expect(screen.getByText("Installation")).toBeInTheDocument();
  });

  it("renders step content", () => {
    const Component = installStep.render;
    const { container } = render(() => <Component />);
    const stepContent = container.querySelector(".space-y-4");
    expect(stepContent).toBeInTheDocument();
  });
});
