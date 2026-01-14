import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { connectStep } from "@/components/molecules/steps/Connect.tsx";

describe("Connect", () => {
  afterEach(() => {
    cleanup();
  });

  it("has correct step title", () => {
    expect(connectStep.title).toBe("Connect");
  });

  it("has canGoNext function that returns true", () => {
    expect(connectStep.canGoNext?.()).toBe(true);
  });

  it("renders connect step", () => {
    const Component = connectStep.render;
    render(() => <Component />);
    expect(
      screen.getByText(
        /Connect your microcontroller with an USB cable to your computer/
      )
    ).toBeInTheDocument();
  });

  it("renders connection instructions", () => {
    const Component = connectStep.render;
    render(() => <Component />);
    expect(screen.getByText(/Connect your microcontroller/)).toBeInTheDocument();
    expect(screen.getByText(/SelectField the microcontroller type/)).toBeInTheDocument();
    expect(screen.getByText(/Click the install button/)).toBeInTheDocument();
  });

  it("renders status checks", () => {
    const Component = connectStep.render;
    render(() => <Component />);
    expect(screen.getByText("Connection")).toBeInTheDocument();
    expect(screen.getByText("Port")).toBeInTheDocument();
    expect(screen.getByText("Readable")).toBeInTheDocument();
    expect(screen.getByText("Writable")).toBeInTheDocument();
    expect(screen.getByText("Executable")).toBeInTheDocument();
    expect(screen.getByText("Flashable")).toBeInTheDocument();
  });

  it("renders select field", () => {
    const Component = connectStep.render;
    const { container } = render(() => <Component />);
    // The SelectField should be rendered (checking by placeholder text)
    expect(screen.getByText(/SelectField a board/)).toBeInTheDocument();
  });
});
