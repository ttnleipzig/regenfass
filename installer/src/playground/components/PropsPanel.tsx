import { Component, For, createSignal, Show } from "solid-js";
import type { PropInfo } from "../types";

interface PropsPanelProps {
  props: PropInfo[];
  values: Record<string, any>;
  onChange: (prop: string, value: any) => void;
}

const PropsPanel: Component<PropsPanelProps> = (props) => {
  const [isCollapsed, setIsCollapsed] = createSignal(false);

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const fillExamples = () => {
    props.props.forEach((propInfo) => {
      switch (propInfo.controlType) {
        case 'text': {
          const sample = capitalize(propInfo.name || 'Sample');
          props.onChange(propInfo.name, sample);
          break;
        }
        case 'number': {
          props.onChange(propInfo.name, 42);
          break;
        }
        case 'color': {
          props.onChange(propInfo.name, '#4F46E5');
          break;
        }
        case 'select': {
          const first = (propInfo.options && propInfo.options[0]) || '';
          if (first) props.onChange(propInfo.name, first);
          break;
        }
        case 'boolean': {
          props.onChange(propInfo.name, true);
          break;
        }
      }
    });

    // Special handling: when the prop name is "class", append Tailwind utility classes
    const hasClassProp = props.props.find((p) => p.name === 'class');
    if (hasClassProp) {
      const existing = props.values['class'] || '';
      const extra = ' font-semibold';
      const merged = (existing + extra)
        .split(/\s+/)
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(' ');
      props.onChange('class', merged.trim());
    }
  };

  const renderControl = (propInfo: PropInfo) => {
    const value = () => props.values[propInfo.name] ?? propInfo.defaultValue ?? '';

    switch (propInfo.controlType) {
      case 'boolean':
        return (
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value())}
              onChange={(e) => props.onChange(propInfo.name, e.target.checked)}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                     focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {Boolean(value()) ? 'true' : 'false'}
            </span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value()}
            onInput={(e) => props.onChange(propInfo.name, parseFloat((e.target as HTMLInputElement).value) || 0)}
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value()}
            onChange={(e) => props.onChange(propInfo.name, e.target.value)}
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <For each={propInfo.options || []}>
              {(option) => (
                <option value={option}>{option}</option>
              )}
            </For>
          </select>
        );

      case 'color':
        return (
          <div class="flex items-center space-x-2">
            <input
              type="color"
              value={value()}
              onInput={(e) => props.onChange(propInfo.name, (e.target as HTMLInputElement).value)}
              class="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value()}
              onInput={(e) => props.onChange(propInfo.name, (e.target as HTMLInputElement).value)}
              placeholder="#000000"
              class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      default: // text
        return (
          <input
            type="text"
            value={value()}
            onInput={(e) => props.onChange(propInfo.name, (e.target as HTMLInputElement).value)}
            placeholder={propInfo.defaultValue || `Enter ${propInfo.name}...`}
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  const resetProps = () => {
    props.props.forEach((propInfo) => {
      switch (propInfo.controlType) {
        case 'text':
          props.onChange(propInfo.name, '');
          break;
        case 'number':
          // Use empty string to clear the numeric field visually
          props.onChange(propInfo.name, '');
          break;
        case 'select':
          props.onChange(propInfo.name, '');
          break;
        case 'color':
          // Color inputs cannot be truly empty; fallback to a neutral base
          props.onChange(propInfo.name, '#000000');
          break;
        case 'boolean':
          props.onChange(propInfo.name, false);
          break;
        default:
          props.onChange(propInfo.name, '');
      }
    });

    // Explicitly clear Tailwind class prop if present
    const hasClassProp = props.props.find((p) => p.name === 'class');
    if (hasClassProp) {
      props.onChange('class', '');
    }
  };

  return (
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Props
        </h3>
        <div class="flex items-center space-x-2">
          <button
            onClick={resetProps}
            class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
                   rounded transition-colors"
            title="Reset to defaults"
          >
            Reset
          </button>
          <button
            onClick={fillExamples}
            class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
                   rounded transition-colors"
            title="Fill example values"
          >
            Fill examples
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed())}
            class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 
                   hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <span class={`transition-transform ${isCollapsed() ? '' : 'rotate-180'}`}>
              ▲
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <Show when={!isCollapsed()}>
        <div class="p-4 space-y-4">
          <Show when={props.props.length === 0}>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              This component has no configurable props.
            </p>
          </Show>

          <For each={props.props}>
            {(propInfo) => (
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {propInfo.name}
                    {propInfo.required && (
                      <span class="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {propInfo.type}
                    </code>
                  </div>
                </div>
                
                {renderControl(propInfo)}
                
                <Show when={propInfo.description}>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {propInfo.description}
                  </p>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default PropsPanel;