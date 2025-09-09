import { Component } from "solid-js";
import { IconMoon } from "@tabler/icons-solidjs";

const Header: Component = () => {
  return (
    <header class="w-full py-6 mx-auto">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-transparent bg-gradient-to-br from-sky-700 to-cyan-100 bg-clip-text">
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

        <button
          class="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          onClick={() => {
            const root = document.documentElement;
            const isDark = root.classList.toggle("dark");
            root.setAttribute("data-kb-theme", isDark ? "dark" : "light");
            try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch {}
          }}
          aria-label="Toggle dark mode"
        >
          <IconMoon size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
