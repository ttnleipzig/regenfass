import { Component, JSX, splitProps } from "solid-js";
import {
  Select as SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./FormField";
import { cn } from "@/libs/cn";

export interface SelectProps<T> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  class?: string;
  options: T[];
  placeholder?: string;
  value?: T;
  onChange?: (value: T) => void;
  getValue?: (item: T) => string;
  getLabel?: (item: T) => string;
}

const Select = <T,>(props: SelectProps<T>) => {
  const [local, rest] = splitProps(props, ["label", "required", "error", "helperText", "class", "options", "placeholder", "value", "onChange", "getValue", "getLabel"]);

  const getValueFn = () => local.getValue || ((item: T) => String(item));
  const getLabelFn = () => local.getLabel || ((item: T) => String(item));

  return (
    <FormField
      label={local.label}
      required={local.required}
      error={local.error}
      helperText={local.helperText}
    >
      <SelectBase
        options={local.options}
        placeholder={local.placeholder}
        value={local.value}
        onChange={local.onChange}
        itemComponent={(props) => (
          <SelectItem item={props.item}>
            {getLabelFn()(props.item.rawValue)}
          </SelectItem>
        )}
        class={cn("w-full", local.class)}
      >
        <SelectTrigger class="w-full">
          <SelectValue<T>>
            {(state) => state.selectedOption() ? getLabelFn()(state.selectedOption()!) : local.placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </SelectBase>
    </FormField>
  );
};

export { Select };
