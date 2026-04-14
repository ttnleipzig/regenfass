import { Component, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import type { PlaygroundRegistry, ComponentCategory } from "./types";
import { usePlaygroundRegistry } from "./PlaygroundRegistryContext";

const categoryIcons: Record<ComponentCategory, string> = {
  atoms: "\u269B\uFE0F",
  molecules: "\u{1F9EC}",
  organisms: "\u{1F9A0}",
  ui: "\u{1F3A8}",
  forms: "\u{1F4DD}",
  uncategorized: "\u{1F4E6}",
};

const categoryNames: Record<ComponentCategory, string> = {
  atoms: "Atoms",
  molecules: "Molecules",
  organisms: "Organisms",
  ui: "UI Components",
  forms: "Form Components",
  uncategorized: "Other",
};

const categoryDescriptions: Record<ComponentCategory, string> = {
  atoms: "Basic building blocks that can't be broken down further",
  molecules: "Groups of atoms bonded together to form more complex components",
  organisms: "Groups of molecules joined together to form distinct sections",
  ui: "User interface components and design system elements",
  forms: "Form inputs, validation, and interaction components",
  uncategorized: "Components that don't fit into the standard categories",
};

const PlaygroundHome: Component = () => {
  const reg = usePlaygroundRegistry();

  const getTotalComponents = () => {
    const r = reg as PlaygroundRegistry;
    return Object.values(r).reduce((total, components) => total + components.length, 0);
  };

  return (
    <div class="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Component Playground
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Explore and interact with all {getTotalComponents()} components in the Regenfass design system
        </p>
        <div class="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Interactive props</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Live code examples</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Responsive preview</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={Object.entries(reg) as [ComponentCategory, PlaygroundRegistry[ComponentCategory]][]}>
          {([category, components]) => (
            <Show when={components.length > 0}>
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center mb-4">
                  <div class="text-3xl mr-4">
                    {categoryIcons[category]}
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {categoryNames[category]}
                    </h2>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {components.length} component{components.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {categoryDescriptions[category]}
                </p>

                {/* Component list */}
                <div class="space-y-2">
                  <For each={components.slice(0, 4)}>
                    {(component) => (
                      <A
                        href={`/playground/${category}/${component.name}`}
                        class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium text-gray-900 dark:text-white text-sm">
                              {component.name}
                            </div>
                            <Show when={component.description}>
                              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {component.description}
                              </div>
                            </Show>
                          </div>
                          <div class="text-gray-400 dark:text-gray-500">
                            →
                          </div>
                        </div>
                      </A>
                    )}
                  </For>

                  <Show when={components.length > 4}>
                    <div class="text-center pt-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        +{components.length - 4} more component{components.length - 4 !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
          )}
        </For>
      </div>

      {/* Quick Stats */}
      <div class="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Design System Stats
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {getTotalComponents()}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Components
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">
              {Object.values(reg).filter((comps) => comps.length > 0).length}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Categories
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Object.values(reg).reduce(
                (total: number, comps: PlaygroundRegistry[ComponentCategory]) =>
                  total +
                  comps.reduce((sum: number, comp) => sum + comp.props.length, 0),
                0,
              )}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Interactive Props
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {Object.values(reg).reduce(
                (total: number, comps: PlaygroundRegistry[ComponentCategory]) =>
                  total +
                  comps.reduce((sum: number, comp) => sum + comp.examples.length, 0),
                0,
              )}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Examples
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div class="mt-8 text-center">
        <div class="space-x-4">
          <A
            href="/docs/COMPONENTS.md"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-gray-200 hover:underline"
          >
            {"\u{1F4D6}"} View Documentation
          </A>
          <A
            href="/"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-gray-200 hover:underline"
          >
            {"\u{1F3E0}"} Back to App
          </A>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundHome;
