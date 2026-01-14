import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { configurationStep } from "@/components/molecules/steps/Configuration.tsx";

describe("Configuration", () => {
  afterEach(() => {
    cleanup();
  });

  it("has correct step title", () => {
    expect(configurationStep.title).toBe("Configuration");
  });

  it("renders configuration step", () => {
    const Component = configurationStep.render;
    render(() => <Component />);
    expect(screen.getByText("Configure your application!")).toBeInTheDocument();
  });

  it("renders step content", () => {
    const Component = configurationStep.render;
    const { container } = render(() => <Component />);
    const stepContent = container.querySelector(".space-y-4");
    expect(stepContent).toBeInTheDocument();
  });
});
