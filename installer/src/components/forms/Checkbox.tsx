import { Component, JSX, splitProps } from "solid-js";
import { FormField } from "./FormField";
import { cn } from "@/libs/cn";

export interface CheckboxProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'class'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  class?: string;
}

const Checkbox: Component<CheckboxProps> = (props: CheckboxProps) => {
  const [local, rest] = splitProps(props, ["label", "required", "error", "helperText", "class", "id"]);

  const checkboxId = () => local.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormField
      label={local.label}
      required={local.required}
      error={local.error}
      helperText={local.helperText}
    >
      <div class={cn("flex items-center space-x-2", local.class)}>
        <input
          {...rest}
          type="checkbox"
          id={checkboxId()}
          class={cn(
            "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
            local.error && "border-red-500 focus:ring-red-500"
          )}
          aria-invalid={!!local.error}
        />
        {local.label && (
          <label 
            for={checkboxId()} 
            class="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {local.label}
          </label>
        )}
      </div>
    </FormField>
  );
};

export { Checkbox };
