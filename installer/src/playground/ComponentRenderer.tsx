import { 
  Component, 
  createSignal, 
  createEffect, 
  onMount, 
  Show, 
  For, 
  ErrorBoundary,
  createResource
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { useParams } from "@solidjs/router";
import CodeViewer from "./components/CodeViewer";
import PropsPanel from "./components/PropsPanel";
import type { PlaygroundComponent, ComponentExample, PlaygroundRegistry, PropInfo } from "./types";

// Dynamic imports for all components
const componentImports: Record<string, () => Promise<{ default: any }>> = {
  // Atoms
  'Confetti': () => import('../components/atoms/Confetti'),
  'ConfettiSpinner': () => import('../components/atoms/ConfettiSpinner'),
  'Link': () => import('../components/atoms/Link'),
  
  // Molecules
  'Status': () => import('../components/molecules/Status').then(m => ({ default: m.default ?? m })),
  'Flasher': () => import('../components/molecules/Flasher').then(m => ({ default: m.default ?? m })),
  
  // Organisms
  'Header': () => import('../components/organisms/Header').then(m => ({ default: m.default ?? m })),
  'Footer': () => import('../components/organisms/Footer').then(m => ({ default: m.default ?? m })),
  'Welcome': () => import('../components/organisms/Welcome').then(m => ({ default: m.default ?? m })),
  'Newsletter': () => import('../components/organisms/Newsletter').then(m => ({ default: m.default ?? m })),
  
  // UI
  'Input': () => import('../components/ui/input').then(m => ({ default: m.Input })),
  'Card': () => import('../components/ui/card').then(m => ({ default: (m as any).Card })),
  'Button': () => import('../components/ui/button').then(m => ({ default: (m as any).Button })),
  'Badge': () => import('../components/ui/badge').then(m => ({ default: (m as any).Badge })),
  'Alert': () => import('../components/ui/alert').then(m => ({ default: (m as any).Alert })),
  'Headline': () => import('../components/ui/headline').then(m => ({ default: (m as any).Headline })),
  'Select': () => import('../components/ui/select').then(m => ({ default: (m as any).Select })),
  'SelectTrigger': () => import('../components/ui/select').then(m => ({ default: (m as any).SelectTrigger })),
  'SelectContent': () => import('../components/ui/select').then(m => ({ default: (m as any).SelectContent })),
  'SelectItem': () => import('../components/ui/select').then(m => ({ default: (m as any).SelectItem })),
  'SelectValue': () => import('../components/ui/select').then(m => ({ default: (m as any).SelectValue })),
  'TextField': () => import('../components/ui/textfield').then(m => ({ default: (m as any).TextFieldRoot })),
  
  // Forms
  'Checkbox': () => import('../components/forms/Checkbox').then(m => ({ default: (m as any).Checkbox ?? m.default ?? m })),
  'ErrorList': () => import('../components/forms/ErrorList').then(m => ({ default: (m as any).ErrorList ?? m.default ?? m })),
  'FileUploader': () => import('../components/forms/FileUploader').then(m => ({ default: (m as any).FileUploader ?? m.default ?? m })),
  'FormField': () => import('../components/forms/FormField').then(m => ({ default: (m as any).FormField ?? m.default ?? m })),
  'FormLayout': () => import('../components/forms/FormLayout').then(m => ({ default: (m as any).FormLayout ?? m.default ?? m })),
  'PrimaryButton': () => import('../components/forms/PrimaryButton').then(m => ({ default: (m as any).PrimaryButton ?? m.default ?? m })),
  'SecondaryButton': () => import('../components/forms/SecondaryButton').then(m => ({ default: (m as any).SecondaryButton ?? m.default ?? m })),
  'TextInput': () => import('../components/forms/TextInput').then(m => ({ default: (m as any).TextInput ?? m.default ?? m })),
};

const ComponentRenderer: Component = () => {
  const params = useParams<{ category: string; component: string }>();
  const [component, setComponent] = createSignal<PlaygroundComponent | null>(null);
  const [selectedExample, setSelectedExample] = createSignal<ComponentExample | null>(null);
  const [propValues, setPropValues] = createSignal<Record<string, any>>({});
  const [registry, setRegistry] = createSignal<PlaygroundRegistry | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [viewMode, setViewMode] = createSignal<'desktop' | 'tablet' | 'mobile'>('desktop');

  onMount(async () => {
    try {
      // Load registry
      const response = await fetch('/registry.json');
      if (!response.ok) {
        throw new Error('Failed to load component registry');
      }
      const data = await response.json();
      setRegistry(data);
    } catch (err) {
      console.error('Error loading registry:', err);
      setError(err instanceof Error ? err.message : 'Failed to load registry');
    } finally {
      setLoading(false);
    }
  });

  createEffect(() => {
    const reg = registry();
    const category = params.category;
    const componentName = params.component;
    
    console.log('ComponentRenderer effect - registry:', !!reg, 'category:', category, 'component:', componentName);
    
    if (reg && category && componentName) {
      const categoryComponents = reg[category as keyof PlaygroundRegistry];
      console.log('Category components:', categoryComponents?.length || 0);
      const foundComponent = categoryComponents?.find(c => c.name === componentName);
      console.log('Found component:', foundComponent?.name);
      
      if (foundComponent) {
        setComponent(foundComponent);
        setSelectedExample(foundComponent.examples[0] || null);
        
        // Initialize prop values with defaults
        const initialProps: Record<string, any> = {};
        foundComponent.props.forEach(prop => {
          if (prop.defaultValue !== undefined) {
            initialProps[prop.name] = prop.defaultValue;
          }
        });
        setPropValues(initialProps);
      } else {
        setError(`Component "${componentName}" not found in category "${category}"`);
      }
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
    () => component()?.name,
    async (name) => {
      if (!name) return null;
      const loader = componentImports[name];
      if (!loader) return null;
      const mod = await loader();
      return mod.default;
    }
  );

  const DynamicComponent = () => (
    <ErrorBoundary
      fallback={(err) => (
        <div class="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 class="text-red-800 font-medium">Component Error</h3>
          <p class="text-red-600 text-sm mt-1">{err.toString()}</p>
        </div>
      )}
    >
      <Show
        when={loadedComponent()}
        fallback={<div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />}
      >
        <Dynamic component={loadedComponent()!} {...propValues()} />
      </Show>
    </ErrorBoundary>
  );

  const viewportClasses = () => {
    switch (viewMode()) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  return (
    <Show
      when={!loading()}
      fallback={
        <div class="flex items-center justify-center h-full">
          <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <Show
        when={!error()}
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
              <div class="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
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

                    {/* Viewport controls */}
                    <div class="flex items-center space-x-2">
                      <div class="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                        <button
                          onClick={() => setViewMode('mobile')}
                          class={`px-3 py-1 text-sm rounded ${
                            viewMode() === 'mobile'
                              ? 'bg-white dark:bg-gray-700 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                          title="Mobile view"
                        >
                          📱
                        </button>
                        <button
                          onClick={() => setViewMode('tablet')}
                          class={`px-3 py-1 text-sm rounded ${
                            viewMode() === 'tablet'
                              ? 'bg-white dark:bg-gray-700 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                          title="Tablet view"
                        >
                          📄
                        </button>
                        <button
                          onClick={() => setViewMode('desktop')}
                          class={`px-3 py-1 text-sm rounded ${
                            viewMode() === 'desktop'
                              ? 'bg-white dark:bg-gray-700 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                          title="Desktop view"
                        >
                          🖥️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Examples selector */}
                <Show when={comp().examples.length > 1}>
                  <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
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

                {/* Component preview */}
                <div class="flex-1 overflow-auto p-6">
                  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg min-h-96">
                    <div class="p-8">
                      <div class={viewportClasses()}>
                        <DynamicComponent />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code display */}
                <div class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
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
                    if (comp().name === 'PrimaryButton' || comp().name === 'SecondaryButton') {
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
    </Show>
  );
};

export default ComponentRenderer;