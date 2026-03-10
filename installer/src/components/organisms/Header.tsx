import { Component } from "solid-js";
import { A } from "@solidjs/router";
import { ButtonModeToggle } from "../atoms/ButtonModeToggle.tsx";
import Link from "../atoms/Link.tsx";
import { cn } from "@/libs/cn.ts";

const Header: Component = () => {
  return (
    <header class="w-full py-6 border-b border-border">
      <div class="mx-auto max-w-6xl px-4 flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-100 bg-clip-text">
          Regenfass
        </h1>

        <nav class="hidden md:block">
          <ul class="flex font-medium gap-x-3 text-foreground/80">
            <li>
              <A href="/playground" class={cn(
                "p-2 hover:text-foreground hover:underline",
                "transition-colors"
              )}>
                🎨 Components
              </A>
            </li>
            <li>
              <Link href="https://docs.regenfass.eu/" class="p-2">
                Docs
              </Link>
            </li>
            <li>
              <Link href="https://github.com/ttnleipzig/regenfass" class="p-2">
                GitHub
              </Link>
            </li>
            <li>
              <Link href="https://matrix.to/#/#ttn-leipzig:matrix.org" class="p-2">
                Matrix
              </Link>
            </li>
          </ul>
        </nav>

        <ButtonModeToggle />
      </div>
    </header>
  );
};

export default Header;
