import { Component, JSX, splitProps } from "solid-js";
import { cn } from "@/libs/cn";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "error", "label", "helperText", "id"]);
  
  const inputId = () => local.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = () => `${inputId()}-error`;
  const helperId = () => `${inputId()}-helper`;

  return (
    <div class="space-y-2">
      {local.label && (
        <label 
          for={inputId()} 
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {local.label}
        </label>
      )}
      <input
        {...rest}
        id={inputId()}
        class={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          local.error && "border-red-500 focus-visible:ring-red-500",
          local.class
        )}
        aria-invalid={!!local.error}
        aria-describedby={local.error ? errorId() : local.helperText ? helperId() : undefined}
      />
      {local.error && (
        <p id={errorId()} class="text-sm text-red-600 dark:text-red-400" role="alert">
          {local.error}
        </p>
      )}
      {local.helperText && !local.error && (
        <p id={helperId()} class="text-sm text-gray-500 dark:text-gray-400">
          {local.helperText}
        </p>
      )}
    </div>
  );
};

export { Input };
