import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarNav } from "@regenfass/brand";

const items = [
  { id: "guides", label: "Guides", children: [{ label: "Start", href: "/start" }] },
  { label: "Settings", href: "/settings" },
];

function renderNav(props: Record<string, unknown> = {}) {
  return render(() => (
    <Router>
      <Route path="/*" component={() => <SidebarNav ariaLabel="Docs" items={items} {...props} />} />
    </Router>
  ));
}

describe("SidebarNav", () => {
  afterEach(cleanup);

  it("renders nested links and marks the current route active", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/start");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("supports collapsible groups and emits expanded ids", () => {
    const onExpandedChange = vi.fn();
    renderNav({ collapsible: true, defaultExpanded: [], onExpandedChange });

    expect(screen.queryByRole("link", { name: "Start" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guides" }));
    expect(screen.getByRole("link", { name: "Start" })).toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenCalledWith(["guides"]);
  });
});
