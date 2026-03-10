import { splitProps } from "solid-js";
import {
  SelectField as SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/forms/SelectField.tsx";
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
  const [local] = splitProps(props, ["label", "required", "error", "helperText", "class", "options", "placeholder", "value", "onChange", "getValue", "getLabel"]);
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
        onChange={local.onChange ? (value: T | null) => {
          if (value !== null) {
            local.onChange!(value);
          }
        } : undefined}
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
