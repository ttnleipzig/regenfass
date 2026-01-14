import { Component, createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js";

interface PixelRulerProps {
  containerRef?: HTMLElement;
  onBreakpointChange?: (breakpoint: string, width: number) => void;
}

const BREAKPOINTS = [
  { name: "Responsive", value: "responsive", width: null },
  { name: "Mobile (sm)", value: "sm", width: 640 },
  { name: "Tablet (md)", value: "md", width: 768 },
  { name: "Desktop (lg)", value: "lg", width: 1024 },
  { name: "Large (xl)", value: "xl", width: 1280 },
  { name: "2XL", value: "2xl", width: 1536 },
] as const;

const PixelRuler: Component<PixelRulerProps> = (props) => {
  const [currentWidth, setCurrentWidth] = createSignal(0);
  const [selectedBreakpoint, setSelectedBreakpoint] = createSignal<string>("responsive");
  const [showDropdown, setShowDropdown] = createSignal(false);
  let rulerRef: HTMLDivElement | undefined;
  let containerElement: HTMLElement | null = null;

  const updateWidth = () => {
    const element = props.containerRef || containerElement;
    if (element) {
      // Find the viewport container to get its actual width
      const viewportContainer = element.querySelector('[class*="max-w"]') as HTMLElement;
      const targetElement = viewportContainer || element;
      
      if (targetElement) {
        const width = targetElement.offsetWidth;
        setCurrentWidth(Math.max(width, 0));
      }
    }
  };

  createEffect(() => {
    // Update container reference when prop changes
    if (props.containerRef) {
      containerElement = props.containerRef;
      updateWidth();
    }
  });

  onMount(() => {
    containerElement = props.containerRef || null;

    if (containerElement) {
      updateWidth();
      
      const resizeObserver = new ResizeObserver(() => {
        if (selectedBreakpoint() === 'responsive') {
          updateWidth();
        }
      });

      resizeObserver.observe(containerElement);
      window.addEventListener('resize', updateWidth);

      // Initial delay to ensure layout is complete
      setTimeout(updateWidth, 100);

      onCleanup(() => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateWidth);
      });
    }
  });

  createEffect(() => {
    const breakpoint = selectedBreakpoint();
    const breakpointConfig = BREAKPOINTS.find(bp => bp.value === breakpoint);
    
    // Find the viewport container (the div with viewportClasses)
    const viewportContainer = containerElement?.querySelector('[class*="max-w"]') as HTMLElement;
    const targetElement = viewportContainer || containerElement;
    
    if (breakpointConfig && breakpointConfig.width !== null && targetElement) {
      // Apply max-width to the viewport container
      targetElement.style.maxWidth = `${breakpointConfig.width}px`;
      targetElement.style.marginLeft = 'auto';
      targetElement.style.marginRight = 'auto';
      setCurrentWidth(breakpointConfig.width);
      props.onBreakpointChange?.(breakpoint, breakpointConfig.width);
    } else if (breakpoint === 'responsive' && targetElement) {
      // Remove inline styles to restore CSS classes
      targetElement.style.maxWidth = '';
      targetElement.style.marginLeft = '';
      targetElement.style.marginRight = '';
      // Use setTimeout to ensure layout has updated
      setTimeout(() => {
        updateWidth();
        props.onBreakpointChange?.('responsive', currentWidth());
      }, 10);
    }
  });

  const generateRulerMarks = () => {
    const width = currentWidth();
    if (width === 0) return [];
    
    const marks = [];
    // Determine step size based on width
    let step = 25;
    if (width > 1000) step = 100;
    else if (width > 500) step = 50;
    
    // Generate marks
    for (let i = 0; i <= width; i += step) {
      marks.push(i);
    }
    
    // Always include the last mark if it's not already included
    if (marks[marks.length - 1] !== width) {
      marks.push(width);
    }
    
    return marks;
  };

  const handleBreakpointSelect = (value: string) => {
    setSelectedBreakpoint(value);
    setShowDropdown(false);
  };

  return (
    <div
      ref={rulerRef}
      class="relative bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 select-none"
      style={{ height: '28px' }}
    >
      {/* Breakpoint selector */}
      <div class="absolute left-0 top-0 h-full flex items-center px-2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10">
        <div class="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown())}
            class="flex items-center space-x-1 px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium transition-colors"
          >
            <span>{BREAKPOINTS.find(bp => bp.value === selectedBreakpoint())?.name || 'Responsive'}</span>
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          <Show when={showDropdown()}>
            <div class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 min-w-[160px]">
              <For each={BREAKPOINTS}>
                {(bp) => (
                  <button
                    onClick={() => handleBreakpointSelect(bp.value)}
                    class={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      selectedBreakpoint() === bp.value
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div class="flex items-center justify-between">
                      <span>{bp.name}</span>
                      {bp.width && (
                        <span class="text-gray-500 dark:text-gray-400 ml-2">{bp.width}px</span>
                      )}
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>

      {/* Dimensions display */}
      <div class="absolute left-[180px] top-0 h-full flex items-center px-2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10">
        <span class="text-xs font-mono text-gray-700 dark:text-gray-300">
          {currentWidth()}px
        </span>
      </div>

      {/* Pixel ruler */}
      <div class="absolute left-[260px] right-0 top-0 h-full overflow-x-auto overflow-y-hidden">
        <div class="relative h-full" style={{ width: `${Math.max(currentWidth(), 100)}px` }}>
          <For each={generateRulerMarks()}>
            {(mark) => {
              const width = currentWidth();
              const isMajorMark = width > 1000 
                ? mark % 200 === 0 
                : width > 500 
                  ? mark % 100 === 0 
                  : mark % 50 === 0;
              
              return (
                <div
                  class="absolute top-0 h-full"
                  style={{ left: `${mark}px` }}
                >
                  <div 
                    class={`absolute top-0 left-0 w-px ${
                      isMajorMark ? 'h-3 bg-gray-500 dark:bg-gray-400' : 'h-2 bg-gray-400 dark:bg-gray-500'
                    }`}
                  ></div>
                  <Show when={isMajorMark && mark > 0}>
                    <div class="absolute top-3 left-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {mark}
                    </div>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      <Show when={showDropdown()}>
        <div
          class="fixed inset-0 z-[5]"
          onClick={() => setShowDropdown(false)}
        />
      </Show>
    </div>
  );
};

export default PixelRuler;
