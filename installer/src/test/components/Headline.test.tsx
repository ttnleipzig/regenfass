import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Headline } from "@/components/ui/headline";
import { IconAlertCircle } from "@tabler/icons-solidjs";

describe("Headline", () => {
  it("renders text with default h2", () => {
    render(() => <Headline>Configuration</Headline>);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("supports different levels", () => {
    const { unmount } = render(() => <Headline as="h3">Title</Headline>);
    expect(screen.getByText("Title").tagName).toBe("H3");
    unmount?.();
  });

  it("shows subtitle and icon", () => {
    render(() => (
      <Headline subtitle="Sub" icon={<IconAlertCircle size={16} />}>Title</Headline>
    ));
    expect(screen.getByText("Sub")).toBeInTheDocument();
  });
});


