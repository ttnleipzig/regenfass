import { cn } from "@/libs/cn";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type {
  TextFieldDescriptionProps,
  TextFieldErrorMessageProps,
  TextFieldInputProps,
  TextFieldLabelProps,
  TextFieldProps,
} from "@kobalte/core/text-field";
import { TextField as TextFieldPrimitive } from "@kobalte/core/text-field";
import type { ParentProps, ValidComponent } from "solid-js";
import { Show, splitProps } from "solid-js";

export const TextField = TextFieldPrimitive;

type textFieldRootProps<T extends ValidComponent = "div"> = ParentProps<
  TextFieldProps<T> & { class?: string; required?: boolean }
>;

export const TextFieldRoot = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, textFieldRootProps<T>>,
) => {
  const [local, rest] = splitProps(props as textFieldRootProps, [
    "class",
    "children",
  ]);

  return (
    <TextFieldPrimitive
      class={cn("space-y-2", local.class)}
      {...rest}
    >
      {local.children}
    </TextFieldPrimitive>
  );
};

type textFieldLabelProps<T extends ValidComponent = "label"> = ParentProps<
  TextFieldLabelProps<T> & { class?: string }
>;

export const TextFieldLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, textFieldLabelProps<T>>,
) => {
  const [local, rest] = splitProps(props as textFieldLabelProps, [
    "class",
    "children",
  ]);
  return (
    <TextFieldPrimitive.Label
      class={cn(
        "block text-sm font-medium text-foreground",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </TextFieldPrimitive.Label>
  );
};

type textFieldInputProps<T extends ValidComponent = "input"> = TextFieldInputProps<T> & {
  class?: string;
};

export const TextFieldInput = <T extends ValidComponent = "input">(
  props: PolymorphicProps<T, textFieldInputProps<T>>,
) => {
  const [local, rest] = splitProps(props as textFieldInputProps, ["class"]);
  return (
    <TextFieldPrimitive.Input
      class={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
};

type textFieldDescriptionProps<T extends ValidComponent = "div"> = ParentProps<
  TextFieldDescriptionProps<T> & { class?: string }
>;

export const TextFieldDescription = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, textFieldDescriptionProps<T>>,
) => {
  const [local, rest] = splitProps(props as textFieldDescriptionProps, [
    "class",
    "children",
  ]);
  return (
    <TextFieldPrimitive.Description
      class={cn("text-sm text-muted-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </TextFieldPrimitive.Description>
  );
};

type textFieldErrorMessageProps<T extends ValidComponent = "div"> = ParentProps<
  TextFieldErrorMessageProps<T> & { class?: string }
>;

export const TextFieldErrorMessage = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, textFieldErrorMessageProps<T>>,
) => {
  const [local, rest] = splitProps(props as textFieldErrorMessageProps, [
    "class",
    "children",
  ]);
  return (
    <TextFieldPrimitive.ErrorMessage
      class={cn("text-sm text-destructive", local.class)}
      {...rest}
    >
      {local.children}
    </TextFieldPrimitive.ErrorMessage>
  );
};

