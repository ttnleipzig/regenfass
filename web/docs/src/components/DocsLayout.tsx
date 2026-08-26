import type { ParentProps } from "solid-js";
import { SidebarNav } from "@regenfass/brand";
import { DOCS_NAV } from "../lib/nav";

export function DocsSidebar() {
  return (
    <div class="space-y-3">
      <p class="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contents
      </p>
      <SidebarNav
        ariaLabel="Documentation"
        items={DOCS_NAV}
        class="space-y-1"
      />
    </div>
  );
}

export function DocsLayout(props: ParentProps) {
  return (
    <div class="site-container flex-1 py-8 lg:py-10">
      <div class="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside class="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <DocsSidebar />
        </aside>
        <div class="min-w-0">{props.children}</div>
      </div>
    </div>
  );
}
