import { Component, createEffect, createSignal } from "solid-js";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/themes/prism.css";

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  showCopy?: boolean;
}

const CodeViewer: Component<CodeViewerProps> = (props) => {
  const [copied, setCopied] = createSignal(false);
  let codeRef: HTMLElement | undefined;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Render highlighted HTML with Prism (keeps soft-wrap)
  createEffect(() => {
    if (codeRef) {
      const lang = (props.language || 'tsx').toLowerCase();
      const grammar = Prism.languages[lang] || Prism.languages.tsx;
      codeRef.innerHTML = Prism.highlight(props.code, grammar, lang);
    }
  });

  return (
    <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div class="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {props.title || `${props.language?.toUpperCase() || 'CODE'}`}
          </span>
        </div>
        
        {props.showCopy !== false && (
          <button
            onClick={copyToClipboard}
            class="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 
                   rounded transition-colors"
            title="Copy to clipboard"
          >
            <span>{copied() ? '✅' : '📋'}</span>
            <span>{copied() ? 'Copied!' : 'Copy'}</span>
          </button>
        )}
      </div>
      
      {/* Code content */}
      <div class="relative">
        <pre class="w-full max-w-full overflow-x-auto p-4 text-sm leading-relaxed">
          <code
            ref={codeRef}
            class="block min-w-0 whitespace-pre-wrap break-words break-all text-gray-800 dark:text-gray-200 font-mono"
          >
            {props.code}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;