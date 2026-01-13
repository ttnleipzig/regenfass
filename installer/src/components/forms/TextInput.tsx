import { Component, JSX, splitProps, createMemo } from "solid-js";
import { InputField } from "@/components/forms/InputField.tsx";
import { FormField } from "./FormField";
import { cn } from "@/libs/cn";

export interface TextInputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  class?: string;
}

const TextInput: Component<TextInputProps> = (props) => {
  const [local, rest] = splitProps(props, ["label", "required", "error", "helperText", "class", "id"]);
  
  const inputId = createMemo(() => local.id || `input-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <FormField
      label={local.label}
      required={local.required}
      error={local.error}
      id={inputId()}
    >
      <InputField
        {...rest}
        id={inputId()}
        class={cn("w-full", local.class)}
        error={local.error}
        helperText={local.helperText}
      />
    </FormField>
  );
};

export { TextInput };
