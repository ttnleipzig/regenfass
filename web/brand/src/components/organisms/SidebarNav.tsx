import { A, useLocation } from "@solidjs/router";
import { For, Show, createSignal, type JSX } from "solid-js";
import { cn } from "../../libs/cn.ts";

export type SidebarNavItem = {
  id?: string;
  label: string;
  href?: string;
  children?: SidebarNavItem[];
};

export type SidebarNavProps = {
  items: SidebarNavItem[];
  ariaLabel: string;
  collapsible?: boolean;
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  onNavigate?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
  class?: string;
};

function itemId(item: SidebarNavItem) {
  return item.id ?? item.href ?? item.label;
}

function pathOf(href: string) {
  return href.split("#")[0] || "/";
}

export function SidebarNav(props: SidebarNavProps) {
  const location = useLocation();
  const [internalExpanded, setInternalExpanded] = createSignal(
    new Set(props.defaultExpanded ?? props.items.map(itemId)),
  );

  const isExpanded = (id: string) =>
    props.expanded ? props.expanded.includes(id) : internalExpanded().has(id);

  const toggle = (id: string) => {
    const next = new Set(props.expanded ?? internalExpanded());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const values = [...next];
    if (props.expanded === undefined) setInternalExpanded(next);
    props.onExpandedChange?.(values);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    const path = pathOf(href);
    if (path === "/") return location.pathname === "/" && !href.includes("#");
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const link = (item: SidebarNavItem, nested: boolean) => (
    <Show when={item.href} fallback={<span>{item.label}</span>}>
      <A
        href={item.href!}
        end
        onClick={props.onNavigate}
        class={cn(
          "block rounded-md px-3 py-2 text-sm transition-colors",
          isActive(item.href)
            ? "border-border bg-accent text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          nested && "pl-3",
        )}
        activeClass="border-border bg-accent text-foreground shadow-sm"
      >
        {item.label}
      </A>
    </Show>
  );

  const renderItems = (items: SidebarNavItem[], nested = false) => (
    <ul class={cn("space-y-1", nested && "mt-1 ml-3 border-l border-border pl-3")}>
      <For each={items}>
        {(item) => {
          const id = itemId(item);
          const hasChildren = Boolean(item.children?.length);
          return (
            <li>
              <Show
                when={hasChildren && props.collapsible}
                fallback={link(item, nested)}
              >
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  aria-expanded={isExpanded(id)}
                  onClick={() => toggle(id)}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" class={cn("transition-transform", isExpanded(id) && "rotate-180")}>⌄</span>
                </button>
              </Show>
              <Show when={hasChildren && (!props.collapsible || isExpanded(id))}>
                {renderItems(item.children!, true)}
              </Show>
            </li>
          );
        }}
      </For>
    </ul>
  );

  return <nav aria-label={props.ariaLabel} class={props.class}>{renderItems(props.items)}</nav>;
}
