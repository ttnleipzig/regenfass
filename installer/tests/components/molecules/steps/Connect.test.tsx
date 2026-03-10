import { describe, it, expect, afterEach } from "vitest";
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
    const { container } = render(() => <Component />);
    // Check for the paragraph text specifically
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toContain("Connect your microcontroller with an USB cable to your computer");
  });

  it("renders connection instructions", () => {
    const Component = connectStep.render;
    const { container } = render(() => <Component />);
    // Check for the ordered list items
    const listItems = container.querySelectorAll("ol li");
    expect(listItems.length).toBeGreaterThanOrEqual(3);
    // Check that the instructions are present in the list items
    const listText = Array.from(listItems).map(li => li.textContent).join(" ");
    expect(listText).toContain("Connect your microcontroller");
    expect(listText).toContain("SelectField the microcontroller type");
    expect(listText).toContain("Click the install button");
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
    render(() => <Component />);
    // The SelectField should be rendered (checking by placeholder text)
    // Use getAllByText since the text appears multiple times
    const selectFields = screen.getAllByText(/SelectField a board/);
    expect(selectFields.length).toBeGreaterThan(0);
  });
});
