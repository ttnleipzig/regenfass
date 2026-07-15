import { Component, For, Show, mergeProps, type JSX } from "solid-js";
import { A } from "@solidjs/router";
import { ButtonModeToggle } from "../atoms/ButtonModeToggle.tsx";
import Link from "../atoms/Link.tsx";
import { cn } from "../../libs/cn.ts";

export type HeaderNavItem = {
  href: string;
  label: string;
  /** Use Solid router `<A>` for in-app paths; external http(s) always use `<a>`/`Link`. */
  external?: boolean;
  /** Optional click handler (e.g. analytics before navigate). */
  onClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
};

export type HeaderProps = {
  /** Optional brand title shown in the header. */
  title?: string;
  /** Navigation items. Defaults link to docs, installer, GitHub, and Matrix. */
  navItems?: HeaderNavItem[];
  /** Extra controls rendered next to the color-mode toggle. */
  trailing?: JSX.Element;
};

const DEFAULT_NAV_ITEMS: HeaderNavItem[] = [
  { href: "https://brand.regenfass.eu", label: "🎨 Components", external: true },
  { href: "https://docs.regenfass.eu/", label: "Docs", external: true },
  { href: "https://install.regenfass.eu", label: "Installer", external: true },
  { href: "https://github.com/ttnleipzig/regenfass", label: "GitHub", external: true },
  { href: "https://matrix.to/#/#ttn-leipzig:matrix.org", label: "Matrix", external: true },
];

const Header: Component<HeaderProps> = (rawProps) => {
  const props = mergeProps(
    { title: "Regenfass", navItems: DEFAULT_NAV_ITEMS },
    rawProps,
  );

  const isExternal = (item: HeaderNavItem) =>
    item.external === true ||
    (typeof item.href === "string" &&
      (item.href.startsWith("http://") || item.href.startsWith("https://")));

  return (
    <header class="w-full py-6 border-b border-border">
      <div class="site-container flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-100 bg-clip-text">
          {props.title}
        </h1>

        <nav class="hidden md:block">
          <ul class="flex font-medium gap-x-3 text-foreground/80">
            <For each={props.navItems}>
              {(item) => (
                <li>
                  <Show
                    when={isExternal(item)}
                    fallback={
                      <A
                        href={item.href}
                        class={cn(
                          "p-2 hover:text-foreground hover:underline",
                          "transition-colors",
                        )}
                        onClick={item.onClick}
                      >
                        {item.label}
                      </A>
                    }
                  >
                    <Link href={item.href} class="p-2" onClick={item.onClick}>
                      {item.label}
                    </Link>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </nav>

        <div class="flex items-center gap-1">
          {props.trailing}
          <ButtonModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
