import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/libs/cn.ts";
import {
  TextFieldRoot,
  TextFieldInput,
  TextFieldLabel,
  TextFieldDescription,
  TextFieldErrorMessage,
} from "@/components/forms/TextField.tsx";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  class?: string;
}

const InputField: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "error", "label", "helperText", "id"]);

  const inputId = () => local.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <TextFieldRoot class="space-y-2">
      {local.label && (
        <TextFieldLabel for={inputId()} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {local.label}
        </TextFieldLabel>
      )}
      <TextFieldInput
        {...rest}
        id={inputId()}
        class={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          local.error && "border-red-500 focus-visible:ring-red-500",
          local.class,
        )}
        aria-invalid={!!local.error}
        aria-describedby={local.error ? `${inputId()}-error` : local.helperText ? `${inputId()}-helper` : undefined}
      />
      {local.error ? (
        <TextFieldErrorMessage id={`${inputId()}-error`} class="text-sm text-red-600 dark:text-red-400" role="alert">
          {local.error}
        </TextFieldErrorMessage>
      ) : (
        local.helperText && (
          <TextFieldDescription id={`${inputId()}-helper`} class="text-sm text-gray-500 dark:text-gray-400">
            {local.helperText}
          </TextFieldDescription>
        )
      )}
    </TextFieldRoot>
  );
};

export { InputField };
