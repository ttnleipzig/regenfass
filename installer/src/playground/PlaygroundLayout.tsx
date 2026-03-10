import { Component, createSignal, onMount, Suspense } from "solid-js";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core/color-mode";
import Sidebar from "./components/Sidebar";
import type { PlaygroundRegistry, PlaygroundComponent, ComponentExample } from "./types";

interface PlaygroundLayoutProps {
  registry?: PlaygroundRegistry;
  children?: any;
}

const PlaygroundLayout: Component<PlaygroundLayoutProps> = (props) => {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [registry, setRegistry] = createSignal<PlaygroundRegistry | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      let baseRegistry: PlaygroundRegistry | null = null;
      if (props.registry) {
        baseRegistry = props.registry;
      } else {
        try {
          const response = await fetch('/registry.json');
          if (!response.ok) throw new Error('not-ok');
          baseRegistry = await response.json();
        } catch {
          baseRegistry = null;
        }
      }

      // Build a runtime registry from actual source files so Sidebar is always up-to-date
      const buildRuntimeRegistry = (): PlaygroundRegistry => {
        const loaders = {
          ...import.meta.glob('../components/**/*.{ts,tsx}', { eager: false })
        };

        const categories = ['atoms', 'molecules', 'organisms', 'ui', 'forms'] as const;
        const result: PlaygroundRegistry = {
          atoms: [],
          molecules: [],
          organisms: [],
          ui: [],
          forms: [],
          uncategorized: [],
        };

        const seen = new Set<string>();

        Object.keys(loaders).forEach((key) => {
          // Compute relative path under components/
          let rel = key
            .replace(/^.*\/src\/components\//, '')
            .replace(/^\.\.\/components\//, '');

          if (!rel || rel.endsWith('.d.ts')) return;

          const withoutExt = rel.replace(/\.(tsx|ts)$/i, '');
          const segments = withoutExt.split('/');
          const first = segments[0];
          const category = (categories as readonly string[]).includes(first) ? first : 'uncategorized';
          const fileBase = segments[segments.length - 1];

          // Derive component name from filename
          const name = fileBase.charAt(0).toUpperCase() + fileBase.slice(1);
          const importPath = `@/components/${withoutExt}`;

          const keyId = `${category}:${name}`;
          if (seen.has(keyId)) return;
          seen.add(keyId);

          const examples: ComponentExample[] = [
            {
              name: 'Default',
              description: 'Default component appearance',
              props: {},
              code: `<${name} />`,
            },
          ];

          const entry: PlaygroundComponent = {
            name,
            filePath: '',
            relativePath: rel,
            category,
            description: '',
            props: [],
            examples,
            importPath,
          };

          (result as any)[category].push(entry);
        });

        return result;
      };

      const runtimeRegistry = buildRuntimeRegistry();

      // Merge base registry (from file) with runtime entries, preferring base metadata when present
      const merged: PlaygroundRegistry = {
        atoms: [], molecules: [], organisms: [], ui: [], forms: [], uncategorized: []
      } as PlaygroundRegistry;

      const mergeCategory = (cat: keyof PlaygroundRegistry) => {
        const base = baseRegistry?.[cat] ?? [];
        const fromRuntime = runtimeRegistry[cat];
        const byName = new Map<string, PlaygroundComponent>();
        base.forEach(c => byName.set(c.name, c));
        fromRuntime.forEach(c => {
          if (!byName.has(c.name)) byName.set(c.name, c);
        });
        (merged as any)[cat] = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
      };

      (['atoms','molecules','organisms','ui','forms','uncategorized'] as (keyof PlaygroundRegistry)[])
        .forEach(mergeCategory);

      setRegistry(merged);
    } catch (err) {
      console.error('Error loading registry:', err);
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      setLoading(false);
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen());
  };

  return (
    <>
      <ColorModeScript />
      <ColorModeProvider>
        <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
          {loading() ? (
            <div class="flex items-center justify-center h-screen">
              <div class="text-center">
                <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Loading components…</p>
              </div>
            </div>
          ) : error() ? (
            <div class="flex items-center justify-center h-screen">
              <div class="text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Failed to load playground
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  {error()}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : registry() ? (
            <div class="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar
                registry={registry()!}
                isOpen={sidebarOpen()}
                onToggle={toggleSidebar}
              />

              {/* Main content */}
              <div class="flex-1 flex flex-col lg:ml-0 overflow-hidden">
                {/* Mobile header */}
                <header class="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div class="flex items-center justify-between">
                    <button
                      onClick={toggleSidebar}
                      class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <span class="sr-only">Open sidebar</span>
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>

                    <div class="flex items-center gap-2">
                      <button class="px-2 py-1 text-sm border rounded">Theme</button>
                    </div>
                  </div>
                </header>
                {/* Desktop header */}
                <header class="hidden lg:flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
                  <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Component Playground</h1>
                  <div class="flex items-center gap-2">
                    <button class="px-2 py-1 text-sm border rounded">Theme</button>
                  </div>
                </header>

                {/* Main content area */}
                <main class="flex-1 overflow-y-auto overflow-x-hidden">
                  <Suspense
                    fallback={
                      <div class="flex items-center justify-center h-full">
                        <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    }
                  >
                    {props.children}
                  </Suspense>
                </main>
              </div>

              {/* Overlay for mobile sidebar */}
              {sidebarOpen() && (
                <div
                  class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                  onClick={toggleSidebar}
                />
              )}
            </div>
          ) : null}
        </div>
      </ColorModeProvider>
    </>
  );
};

export default PlaygroundLayout;
