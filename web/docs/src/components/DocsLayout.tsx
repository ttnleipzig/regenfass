import { For, Show, type ParentProps } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { cn } from "@regenfass/brand";
import { DOCS_NAV, type NavItem } from "../lib/nav";

function NavBranch(props: { items: NavItem[]; depth?: number }) {
  const location = useLocation();
  const depth = () => props.depth ?? 0;

  const isActive = (href: string) => {
    const path = href.split("#")[0] || "/";
    if (path === "/") {
      return location.pathname === "/" && !href.includes("#");
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <ul class={cn("space-y-1", depth() > 0 && "mt-1 ml-3 border-l border-border pl-3")}>
      <For each={props.items}>
        {(item) => (
          <li>
            <A
              href={item.href}
              class={cn(
                "block rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {item.label}
            </A>
            <Show when={item.children?.length}>
              <NavBranch items={item.children!} depth={depth() + 1} />
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
}

export function DocsSidebar() {
  return (
    <nav aria-label="Documentation" class="space-y-3">
      <p class="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contents
      </p>
      <NavBranch items={DOCS_NAV} />
    </nav>
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
