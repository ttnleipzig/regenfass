import { Component, JSX, splitProps } from "solid-js";
import { cn } from "@/libs/cn";

export interface FormFieldProps extends JSX.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

const FormField: Component<FormFieldProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "label", "required", "error", "helperText", "children", "id"]);

  return (
    <div class={cn("space-y-2", local.class)} {...rest}>
      {local.label && (
        <label for={local.id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {local.label}
          {local.required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
      {local.children}
      {local.error && (
        <p class="text-sm text-red-600 dark:text-red-400" role="alert">
          {local.error}
        </p>
      )}
      {local.helperText && !local.error && (
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {local.helperText}
        </p>
      )}
    </div>
  );
};

export { FormField };
