import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "@regenfass/brand";

describe("AppShell", () => {
  afterEach(cleanup);

  it("renders header, main content, and optional footer", () => {
    render(() => (
      <AppShell header={<header>Header</header>} footer={<footer>Footer</footer>}>
        Content
      </AppShell>
    ));

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Content");
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("allows custom main classes", () => {
    render(() => <AppShell header={<header />} mainClass="flex flex-col">Content</AppShell>);
    expect(screen.getByRole("main")).toHaveClass("flex", "flex-col");
  });
});
