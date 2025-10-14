import { Component, For, createSignal, Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import type { PlaygroundRegistry, ComponentCategory } from "../types";

interface SidebarProps {
  registry: PlaygroundRegistry;
  isOpen: boolean;
  onToggle: () => void;
}

const categoryIcons: Record<ComponentCategory, string> = {
  atoms: "⚛️",
  molecules: "🧬", 
  organisms: "🦠",
  ui: "🎨",
  forms: "📝",
  uncategorized: "📦",
};

const categoryNames: Record<ComponentCategory, string> = {
  atoms: "Atoms",
  molecules: "Molecules",
  organisms: "Organisms", 
  ui: "UI Components",
  forms: "Form Components",
  uncategorized: "Other",
};

const Sidebar: Component<SidebarProps> = (props) => {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [expandedCategories, setExpandedCategories] = createSignal<Set<ComponentCategory>>(
    new Set(['atoms', 'molecules', 'organisms', 'ui', 'forms'])
  );
  const location = useLocation();

  const toggleCategory = (category: ComponentCategory) => {
    const expanded = expandedCategories();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    
    setExpandedCategories(newExpanded);
  };

  const filteredRegistry = () => {
    const term = searchTerm().toLowerCase();
    if (!term) return props.registry;

    const filtered: PlaygroundRegistry = {
      atoms: [],
      molecules: [],
      organisms: [],
      ui: [],
      forms: [],
      uncategorized: [],
    };

    Object.entries(props.registry).forEach(([category, components]) => {
      filtered[category as ComponentCategory] = components.filter(
        (comp) => comp.name.toLowerCase().includes(term) ||
                 comp.description.toLowerCase().includes(term)
      );
    });

    return filtered;
  };

  const isActiveComponent = (componentName: string, category: ComponentCategory) => {
    return location.pathname === `/playground/${category}/${componentName}`;
  };

  return (
    <aside class={`
      fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40
      transition-transform duration-300 ease-in-out
      ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}
      w-80 lg:translate-x-0 lg:static lg:z-0
    `}>
      <div class="flex flex-col h-full">
        {/* Header */}
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Component Playground
            </h2>
            <button
              onClick={props.onToggle}
              class="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          {/* Search */}
          <div class="relative">
            <input
              type="text"
              placeholder="Search components…"
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
              class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span class="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
          <For each={Object.entries(filteredRegistry()) as [ComponentCategory, any[]][]}>
            {([category, components]) => (
              <Show when={components.length > 0}>
                <div class="mb-4">
                  <button
                    onClick={() => toggleCategory(category)}
                    class="flex items-center justify-between w-full px-3 py-2 text-sm font-medium 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 
                           rounded-md transition-colors"
                  >
                    <div class="flex items-center space-x-2">
                      <span>{categoryIcons[category]}</span>
                      <span>{categoryNames[category]}</span>
                      <span class="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {components.length}
                      </span>
                    </div>
                    <span class={`transition-transform ${expandedCategories().has(category) ? 'rotate-90' : ''}`}>
                      ▶️
                    </span>
                  </button>
                  
                  <Show when={expandedCategories().has(category)}>
                    <div class="ml-4 mt-2 space-y-1">
                      <For each={components}>
                        {(component) => (
                          <A
                            href={`/playground/${category}/${component.name}`}
                            class={`
                              block px-3 py-2 text-sm rounded-md transition-colors
                              ${isActiveComponent(component.name, category)
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                              }
                            `}
                          >
                            <div class="font-medium">{component.name}</div>
                            <Show when={component.description}>
                              <div class="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                {component.description}
                              </div>
                            </Show>
                          </A>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </Show>
            )}
          </For>
        </nav>

        {/* Footer */}
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <A
            href="/"
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
                   rounded-md transition-colors"
          >
            <span>←</span>
            <span>Back to App</span>
          </A>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;