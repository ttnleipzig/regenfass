import { Component, For, Show, createMemo, mergeProps, type JSX } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { ButtonModeToggle } from "../atoms/ButtonModeToggle.tsx";
import Link from "../atoms/Link.tsx";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher.tsx";
import { cn } from "../../libs/cn.ts";

export type HeaderNavItem = {
  href: string;
  label: string;
  children?: HeaderNavItem[];
  /** Use Solid router `<A>` for in-app paths; external http(s) always use `<a>`/`Link`. */
  external?: boolean;
  /** Optional click handler (e.g. analytics before navigate). */
  onClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
};

export type HeaderProps = {
	/** Optional brand title shown in the header. */
	title?: string;
	/** Optional title suffix rendered separately from the brand title. */
	titleSuffix?: string;
	/** Stretch the header content across the available width instead of using the site container. */
	fullWidth?: boolean;
  /** Navigation items. Defaults link to Home, docs, installer, and GitHub. */
  navItems?: HeaderNavItem[];
  /** Position of the navigation relative to the title. */
  navPosition?: "right" | "left";
  /** Extra controls rendered next to the color-mode toggle. */
  trailing?: JSX.Element;
};

const DEFAULT_NAV_ITEMS: HeaderNavItem[] = [
  { href: "https://regenfass.eu/", label: "Home", external: true },
  { href: "https://docs.regenfass.eu/", label: "Docs", external: true },
  { href: "https://install.regenfass.eu", label: "Installer", external: true },
  { href: "https://github.com/ttnleipzig/regenfass", label: "GitHub", external: true },
];

const LOCAL_REGENFASS_URLS = [
  ["https://regenfass.eu/", "http://localhost:5175/"],
  ["https://docs.regenfass.eu/", "http://localhost:5176/"],
  ["https://install.regenfass.eu", "http://localhost:5173/"],
] as const;

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function resolveNavHref(href: string) {
  if (typeof window === "undefined" || !isLocalHost(window.location.hostname)) {
    return href;
  }

  for (const [productionHref, localHref] of LOCAL_REGENFASS_URLS) {
    if (href.startsWith(productionHref)) {
      return href.replace(productionHref, localHref);
    }
  }

  return href;
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

const Header: Component<HeaderProps> = (rawProps) => {
  const props = mergeProps(
    { title: "Regenfass", navItems: DEFAULT_NAV_ITEMS, navPosition: "right" as const },
    rawProps,
  );
  const location = useLocation();

  const currentUrl = createMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return new URL(location.pathname + location.search + location.hash, window.location.origin);
    } catch {
      return null;
    }
  });

  const resolvedUrl = (item: HeaderNavItem) => {
    try {
      return new URL(resolveNavHref(item.href), currentUrl()?.href ?? window.location.href);
    } catch {
      return null;
    }
  };

  const isCurrentItem = (item: HeaderNavItem) => {
    const activeUrl = currentUrl();
    const targetUrl = resolvedUrl(item);
    if (!activeUrl || !targetUrl) return false;

    return (
      activeUrl.origin === targetUrl.origin &&
      normalizePathname(activeUrl.pathname) === normalizePathname(targetUrl.pathname)
    );
  };

  const usesExternalAnchor = (item: HeaderNavItem) => {
    const activeUrl = currentUrl();
    const targetUrl = resolvedUrl(item);
    if (!activeUrl || !targetUrl) return true;

    return activeUrl.origin !== targetUrl.origin;
  };

  const isItemActive = (item: HeaderNavItem) =>
    isCurrentItem(item) ||
    (item.children?.length
      ? item.children.some((child) => isCurrentItem(child))
      : false);

  const hasActiveChild = (item: HeaderNavItem) =>
    item.children?.some((child) => isCurrentItem(child)) ?? false;

  const navLinkClass = (active: boolean, nested = false) =>
    cn(
      nested
        ? "block rounded-md px-3 py-2 text-sm transition-colors"
        : "p-2 transition-colors underline-offset-4",
      active
        ? "text-primary underline decoration-2"
        : nested
          ? "text-foreground/80 hover:bg-accent hover:text-foreground"
          : "text-foreground/80 hover:text-foreground hover:underline",
      nested && active && "bg-primary/10 text-primary",
    );

  return (
    <header class="w-full py-6 border-b border-border">
      <div
        class={cn(
			"site-container px-4 sm:px-6 lg:px-8 flex items-center",
			props.fullWidth && "max-w-none",
          props.navPosition === "left" ? "justify-start" : "justify-between",
        )}
      >
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-100 bg-clip-text">
          {props.title}
          <Show when={props.titleSuffix}>
            <span class="font-normal text-foreground/80 dark:text-white"> {props.titleSuffix}</span>
          </Show>
        </h1>

        <nav class={cn("hidden md:block", props.navPosition === "left" && "ml-8")}>
          <ul class="flex font-medium gap-x-3 text-foreground/80">
            <For each={props.navItems}>
              {(item) => (
                <li class="relative group">
                  <Show
                    when={!usesExternalAnchor(item)}
                    fallback={
                      <A
                        href={item.href}
                        class={navLinkClass(isItemActive(item))}
                        aria-current={isItemActive(item) ? "page" : undefined}
                        onClick={item.onClick}
                      >
                        {item.label}
                      </A>
                    }
                    >
                    <Link
                      href={resolveNavHref(item.href)}
                      class={navLinkClass(isItemActive(item))}
                      aria-current={isItemActive(item) ? "page" : undefined}
                      onClick={item.onClick}
                    >
                      {item.label}
                    </Link>
                  </Show>

                  <Show when={item.children?.length}>
                    <div
                      class={cn(
                        "absolute left-0 top-full z-20 pt-3",
                        hasActiveChild(item)
                          ? "block"
                          : "hidden group-hover:block group-focus-within:block",
                      )}
                    >
                      <ul class="min-w-44 rounded-xl border border-border bg-background p-2 shadow-lg">
                        <For each={item.children}>
                          {(child) => (
                            <li>
                              <Show
                                when={!usesExternalAnchor(child)}
                                fallback={
                                  <A
                                    href={child.href}
                                    class={navLinkClass(isCurrentItem(child), true)}
                                    aria-current={
                                      isCurrentItem(child) ? "page" : undefined
                                    }
                                    onClick={child.onClick}
                                  >
                                    {child.label}
                                  </A>
                                }
                              >
                                <Link
                                  href={resolveNavHref(child.href)}
                                  class={navLinkClass(isCurrentItem(child), true)}
                                  aria-current={
                                    isCurrentItem(child) ? "page" : undefined
                                  }
                                  onClick={child.onClick}
                                >
                                  {child.label}
                                </Link>
                              </Show>
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </nav>

        <div class={cn("flex items-center gap-1", props.navPosition === "left" && "ml-auto")}>
          {props.trailing}
          <LanguageSwitcher />
          <ButtonModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
