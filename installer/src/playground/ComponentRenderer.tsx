import {
  Component,
  createSignal,
  createEffect,
  Show,
  For,
  ErrorBoundary,
  createResource,
  Suspense
} from "solid-js";
import { useParams } from "@solidjs/router";
import CodeViewer from "./components/CodeViewer";
import PropsPanel from "./components/PropsPanel";
import PixelRuler from "./components/PixelRuler";
import { PlaygroundPreviewShell } from "./PlaygroundPreviewShell";
import { mergePlaygroundExtras } from "./playgroundDefaults";
import { usePlaygroundRegistry } from "./PlaygroundRegistryContext";
import type { PlaygroundComponent, ComponentExample, PlaygroundRegistry, PropInfo } from "./types";

// Dynamic module map for any component under src/components
// Note: import.meta.glob doesn't support path aliases, so we use relative paths
const moduleLoaders: Record<string, () => Promise<any>> = {
  ...import.meta.glob('../components/**/*.{ts,tsx}', { eager: false }),
};

const ComponentRenderer: Component = () => {
  const params = useParams<{ category: string; component: string }>();
  const playgroundRegistry = usePlaygroundRegistry();
  const [component, setComponent] = createSignal<PlaygroundComponent | null>(null);
  const [selectedExample, setSelectedExample] = createSignal<ComponentExample | null>(null);
  const [propValues, setPropValues] = createSignal<Record<string, any>>({});
  const [error, setError] = createSignal<string | null>(null);
  const [previewRoot, setPreviewRoot] = createSignal<HTMLDivElement | undefined>();

  createEffect(() => {
    const reg = playgroundRegistry;
    const category = params.category;
    const componentName = params.component;

    if (!category || !componentName) {
      return;
    }

    const categoryComponents = reg[category as keyof PlaygroundRegistry];
    const foundComponent = categoryComponents?.find((c) => c.name === componentName);

    if (foundComponent) {
      setError(null);
      setComponent(foundComponent);
      setSelectedExample(foundComponent.examples[0] || null);

      // Initialize prop values with defaults
      const initialProps: Record<string, any> = {};
      foundComponent.props.forEach((prop) => {
        if (prop.defaultValue !== undefined) {
          initialProps[prop.name] = prop.defaultValue;
        }
      });

      // Set component-specific default values if no props are defined
      if (foundComponent.props.length === 0) {
        if (foundComponent.name === "Headline") {
          initialProps.children = "Example Headline";
          initialProps.as = "h2";
          initialProps.align = "left";
        } else if (foundComponent.name === "Button") {
          initialProps.children = "Click me";
        } else if (foundComponent.name === "ButtonPrimary") {
          initialProps.children = "Primary Button";
          initialProps.loading = false;
        } else if (foundComponent.name === "ButtonSecondary") {
          initialProps.children = "Secondary Button";
          initialProps.loading = false;
        } else if (foundComponent.name === "Badge") {
          initialProps.children = "Badge";
          initialProps.variant = "default";
        } else if (foundComponent.name === "Link") {
          initialProps.href = "#";
          initialProps.children = "Example Link";
        } else if (foundComponent.name === "Status") {
          initialProps.status = "idle";
          initialProps.message = "Status message";
        } else if (foundComponent.name === "AlertInline") {
          initialProps.children = "Alert message";
          initialProps.variant = "default";
          initialProps.showIcon = true;
        } else if (foundComponent.name === "Card") {
          initialProps.children = "Card content";
        }
      }

      mergePlaygroundExtras(foundComponent.name, initialProps);
      setPropValues(initialProps);
    } else {
      setComponent(null);
      setError(`Component "${componentName}" not found in category "${category}"`);
    }
  });

  const handlePropChange = (propName: string, value: any) => {
    setPropValues(prev => ({
      ...prev,
      [propName]: value
    }));
  };

  const generateCurrentCode = () => {
    const comp = component();
    if (!comp) return '';

    const values = propValues();
    const childrenValue = (values as any)["children"];
    const propsString = Object.entries(values)
      .filter(([key, value]) => key !== 'children')
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        if (typeof value === 'number') {
          return `${key}={${value}}`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(' ');

    const openTag = `<${comp.name}${propsString ? ' ' + propsString : ''}>`;
    const closeTag = `</${comp.name}>`;
    const hasChildren = typeof childrenValue === 'string' && childrenValue.trim().length > 0;

    return `import ${comp.name} from '${comp.importPath}';

${hasChildren ? `${openTag}${childrenValue}${closeTag}` : `<${comp.name}${propsString ? ' ' + propsString : ''} />`}`;
  };

  const [loadedComponent] = createResource(
    () => {
      const comp = component();
      return comp ? { importPath: comp.importPath, name: comp.name } : null;
    },
    async (key) => {
      if (!key) return null;
      const { importPath, name } = key;
      if (!importPath || !name) {
        return null;
      }

      // Normalize the import path to match the glob patterns
      // @/components/atoms/Headline -> atoms/Headline
      const relative = importPath.replace(/^@\/components\//, '').replace(/\.(tsx|ts)$/, '');
      
      // Try multiple matching strategies
      let match: [string, () => Promise<any>] | undefined;
      
      // Strategy 1: Direct match with normalized paths
      match = Object.entries(moduleLoaders).find(([k]) => {
        // Normalize the key to match the relative path
        // The glob pattern returns paths like: "../components/atoms/Button.tsx"
        let normalizedKey = k
          .replace(/^.*\/src\/components\//, '')
          .replace(/^\.\.\/components\//, '')
          .replace(/^@\/components\//, '')
          .replace(/\.(tsx|ts)$/, '');
        
        return normalizedKey === relative;
      });
      
      // Strategy 2: Match by filename only (fallback)
      if (!match) {
        const fileName = relative.split('/').pop();
        match = Object.entries(moduleLoaders).find(([k]) => {
          const keyFileName = k.split('/').pop()?.replace(/\.(tsx|ts)$/, '');
          return keyFileName === fileName;
        });
      }
      
      // Strategy 3: Match by component name in path
      if (!match) {
        const category = relative.split('/')[0];
        match = Object.entries(moduleLoaders).find(([k]) => {
          return k.includes(name) && (k.includes(category) || k.includes('atoms') || k.includes('molecules') || k.includes('organisms'));
        });
      }

      if (match) {
        try {
          const mod = await match[1]();
          
          // Try different ways to get the component
          // 1. Named export matching the component name (exact match)
          if (mod[name]) {
            const comp = mod[name];
            if (typeof comp === 'function') {
              return comp;
            }
            // Sometimes SolidJS components are wrapped, check if it's a component factory
            if (comp && typeof comp === 'object' && 'default' in comp && typeof comp.default === 'function') {
              return comp.default;
            }
          }
          
          // 2. Default export
          if (mod.default) {
            const comp = mod.default;
            if (typeof comp === 'function') {
              return comp;
            }
            // Check if default is an object with the component
            if (comp && typeof comp === 'object' && name in comp && typeof comp[name] === 'function') {
              return comp[name];
            }
          }
          
          // 3. Check if the module itself is the component (for default exports)
          if (typeof mod === 'function') {
            return mod;
          }
          
          // 4. Try case-insensitive match for named exports
          const lowerName = name.toLowerCase();
          const foundKey = Object.keys(mod).find(k => k.toLowerCase() === lowerName);
          if (foundKey) {
            const comp = mod[foundKey];
            if (typeof comp === 'function') {
              return comp;
            }
          }
          
          console.warn(`Component "${name}" not found in module from "${importPath}". Available exports:`, Object.keys(mod));
        } catch (err) {
          console.error(`Error loading component "${name}" from "${importPath}":`, err);
          throw err;
        }
      } else {
        // Try a more flexible search as fallback
        const fallbackMatch = Object.entries(moduleLoaders).find(([k]) => {
          const fileName = k.split('/').pop()?.replace(/\.(tsx|ts)$/, '');
          return fileName === name;
        });
        
        if (fallbackMatch) {
          try {
            const mod = await fallbackMatch[1]();
            if (mod[name] && typeof mod[name] === 'function') {
              return mod[name];
            }
            if (mod.default && typeof mod.default === 'function') {
              return mod.default;
            }
          } catch (err) {
            console.error(`Error loading component "${name}" via fallback:`, err);
            throw err;
          }
        }
      }

      return null;
    }
  );

  const DynamicComponent = () => {
    return (
      <ErrorBoundary
        fallback={(err) => (
          <div class="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 class="text-red-800 font-medium">Component Error</h3>
            <p class="text-red-600 text-sm mt-1">{err.toString()}</p>
          </div>
        )}
      >
        <Suspense fallback={<div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />}>
          {(() => {
            const comp = loadedComponent();
            
            if (!comp) {
              return (
                <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 class="text-yellow-800 font-medium">Component Loading Error</h3>
                  <p class="text-yellow-600 text-sm mt-1">Component not loaded</p>
                </div>
              );
            }
            
            if (typeof comp !== 'function') {
              return (
                <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 class="text-yellow-800 font-medium">Component Loading Error</h3>
                  <p class="text-yellow-600 text-sm mt-1">
                    Component is not a function. Type: {typeof comp}
                  </p>
                </div>
              );
            }
            
            try {
              const Component = comp as any;
              // Access props reactively inside the IIFE - this ensures reactivity
              const currentProps = propValues();
              const { children, ...restProps } = currentProps;
              const shellName = component()?.name ?? "";

              const inner =
                children !== undefined && children !== null && children !== "" ? (
                  <Component {...restProps}>{children}</Component>
                ) : (
                  <Component {...restProps} />
                );

              return (
                <PlaygroundPreviewShell componentName={shellName}>{inner}</PlaygroundPreviewShell>
              );
            } catch (err) {
              return (
                <div class="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 class="text-red-800 font-medium">Rendering Error</h3>
                  <p class="text-red-600 text-sm mt-1">{String(err)}</p>
                  {err instanceof Error && err.stack && (
                    <details class="mt-2">
                      <summary class="text-xs cursor-pointer">Stack trace</summary>
                      <pre class="text-xs mt-1 overflow-auto">{err.stack}</pre>
                    </details>
                  )}
                </div>
              );
            }
          })()}
        </Suspense>
      </ErrorBoundary>
    );
  };

  const viewportClasses = () => {
    // PixelRuler sets max-width inline on this node; surface + border make the frame visible against the gutter.
    return [
      "w-full min-h-[18rem] box-border p-6",
      "bg-white dark:bg-gray-900",
      "rounded-lg border border-gray-200 dark:border-gray-700",
      "shadow-sm",
    ].join(" ");
  };

  return (
    <Show when={!error()}
        fallback={
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="text-6xl mb-4">❌</div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Component not found
              </h1>
              <p class="text-gray-600 dark:text-gray-400">{error()}</p>
            </div>
          </div>
        }
      >
        <Show when={component()}>
          {(comp) => (
            <div class="h-full flex flex-col lg:flex-row">
              {/* Main content area */}
              <div class="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Header */}
                <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
                  <div class="flex items-center justify-between">
                    <div>
                      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                        {comp().name}
                      </h1>
                      <Show when={comp().description}>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">
                          {comp().description}
                        </p>
                      </Show>
                    </div>
                  </div>
                </div>

                {/* Examples selector */}
                <Show when={comp().examples.length > 1}>
                  <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex-shrink-0">
                    <div class="flex items-center space-x-4">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Examples:</span>
                      <div class="flex space-x-2">
                        <For each={comp().examples}>
                          {(example) => (
                            <button
                              onClick={() => {
                                setSelectedExample(example);
                                setPropValues(example.props || {});
                              }}
                              class={`px-3 py-1 text-sm rounded-md transition-colors ${
                                selectedExample()?.name === example.name
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {example.name}
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </div>
                </Show>

                {/* Component preview - shown first on all screen sizes */}
                <div class="p-6 flex-shrink-0">
                  <div
                    ref={setPreviewRoot}
                    class="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg min-h-96 overflow-hidden"
                  >
                    <PixelRuler containerRef={previewRoot()} />
                    <div class="p-8 overflow-x-auto">
                      <div class={viewportClasses()}>
                        <DynamicComponent />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code display - shown second on all screen sizes */}
                <div class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
                  <CodeViewer
                    code={generateCurrentCode()}
                    language="tsx"
                    title="Current Configuration"
                  />
                </div>
              </div>

              {/* Props panel */}
              <div class="lg:w-96 bg-gray-50 dark:bg-gray-950 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 p-6">
                <PropsPanel
                  props={((): PropInfo[] => {
                    const base = comp().props.slice();
                    // Add a slot text control for button-like components
                    if (comp().name === 'ButtonPrimary' || comp().name === 'ButtonSecondary' || comp().name === 'Button') {
                      if (!base.find(p => p.name === 'children')) {
                        base.push({
                          name: 'children',
                          type: 'string',
                          required: false,
                          description: 'Button text (slot content)',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                    }
                    // Add children prop for Headline component
                    if (comp().name === 'Headline') {
                      if (!base.find(p => p.name === 'children')) {
                        base.push({
                          name: 'children',
                          type: 'string',
                          required: true,
                          description: 'Headline text',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                      // Add other Headline props if not already present
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('as')) {
                        base.push({
                          name: 'as',
                          type: "'h1' | 'h2' | 'h3' | 'h4'",
                          required: false,
                          description: 'HTML heading level',
                          controlType: 'select',
                          options: ['h1', 'h2', 'h3', 'h4'],
                          defaultValue: 'h2',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('align')) {
                        base.push({
                          name: 'align',
                          type: "'left' | 'center' | 'right'",
                          required: false,
                          description: 'Text alignment',
                          controlType: 'select',
                          options: ['left', 'center', 'right'],
                          defaultValue: 'left',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('subtitle')) {
                        base.push({
                          name: 'subtitle',
                          type: 'string',
                          required: false,
                          description: 'Optional subtitle text',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for Badge component
                    if (comp().name === 'Badge') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('children')) {
                        base.push({
                          name: 'children',
                          type: 'string',
                          required: true,
                          description: 'Badge text',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('variant')) {
                        base.push({
                          name: 'variant',
                          type: "'default' | 'secondary' | 'destructive' | 'outline'",
                          required: false,
                          description: 'Badge variant',
                          controlType: 'select',
                          options: ['default', 'secondary', 'destructive', 'outline'],
                          defaultValue: 'default',
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for Button component
                    if (comp().name === 'Button') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('variant')) {
                        base.push({
                          name: 'variant',
                          type: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
                          required: false,
                          description: 'Button variant',
                          controlType: 'select',
                          options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
                          defaultValue: 'default',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('size')) {
                        base.push({
                          name: 'size',
                          type: "'default' | 'sm' | 'lg' | 'icon'",
                          required: false,
                          description: 'Button size',
                          controlType: 'select',
                          options: ['default', 'sm', 'lg', 'icon'],
                          defaultValue: 'default',
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for ButtonPrimary and ButtonSecondary
                    if (comp().name === 'ButtonPrimary' || comp().name === 'ButtonSecondary') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('loading')) {
                        base.push({
                          name: 'loading',
                          type: 'boolean',
                          required: false,
                          description: 'Show loading spinner',
                          controlType: 'boolean',
                          defaultValue: false,
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for Link component
                    if (comp().name === 'Link') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('href')) {
                        base.push({
                          name: 'href',
                          type: 'string',
                          required: true,
                          description: 'Link URL',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('children')) {
                        base.push({
                          name: 'children',
                          type: 'string',
                          required: true,
                          description: 'Link text',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for Status component
                    if (comp().name === 'Status') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('status')) {
                        base.push({
                          name: 'status',
                          type: "'idle' | 'loading' | 'success' | 'error'",
                          required: true,
                          description: 'Status type',
                          controlType: 'select',
                          options: ['idle', 'loading', 'success', 'error'],
                          defaultValue: 'idle',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('message')) {
                        base.push({
                          name: 'message',
                          type: 'string',
                          required: true,
                          description: 'Status message',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for AlertInline component
                    if (comp().name === 'AlertInline') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('children')) {
                        base.push({
                          name: 'children',
                          type: 'string',
                          required: true,
                          description: 'Alert message',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('variant')) {
                        base.push({
                          name: 'variant',
                          type: "'default' | 'destructive' | 'info' | 'warning' | 'success'",
                          required: false,
                          description: 'Alert variant',
                          controlType: 'select',
                          options: ['default', 'destructive', 'info', 'warning', 'success'],
                          defaultValue: 'default',
                        } as unknown as PropInfo);
                      }
                      if (!propNames.includes('showIcon')) {
                        base.push({
                          name: 'showIcon',
                          type: 'boolean',
                          required: false,
                          description: 'Show icon',
                          controlType: 'boolean',
                          defaultValue: true,
                        } as unknown as PropInfo);
                      }
                    }
                    // Add props for Card component
                    if (comp().name === 'Card') {
                      const propNames = base.map(p => p.name);
                      if (!propNames.includes('children')) {
                        base.push({
                          name: 'children',
                          type: 'string',
                          required: false,
                          description: 'Card content',
                          controlType: 'text',
                        } as unknown as PropInfo);
                      }
                    }
                    return base;
                  })()}
                  values={propValues()}
                  onChange={handlePropChange}
                />
              </div>
            </div>
          )}
      </Show>
    </Show>
  );
};

export default ComponentRenderer;
