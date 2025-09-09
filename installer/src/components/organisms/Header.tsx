import { Component } from "solid-js";
import { ModeToggle } from "../ui/mode-toggle";

const Header: Component = () => {
  return (
    <header class="w-full py-6">
      <div class="mx-auto max-w-6xl px-4 flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-100 bg-clip-text">
          Regenfass
        </h1>
        
        <nav class="hidden md:block">
          <ul class="flex font-medium text-gray-800 gap-x-3 dark:text-gray-400">
            <li>
              <a href="https://docs.regenfass.eu/" class="p-2 hover:text-slate-500 dark:hover:text-white hover:underline">
                Docs
              </a>
            </li>
            <li>
              <a href="https://github.com/ttnleipzig/regenfass" class="p-2 hover:text-slate-500 dark:hover:text-white hover:underline">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://matrix.to/#/#ttn-leipzig:matrix.org" class="p-2 hover:text-slate-500 dark:hover:text-white hover:underline">
                Matrix
              </a>
            </li>
          </ul>
        </nav>

        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
