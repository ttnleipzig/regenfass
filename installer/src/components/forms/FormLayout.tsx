import { Component, JSX, splitProps } from "solid-js";
import { cn } from "@/libs/cn";

export interface FormLayoutProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  subtitle?: string;
  actions?: JSX.Element;
}

const FormLayout: Component<FormLayoutProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "title", "subtitle", "actions", "children"]);

  return (
    <form 
      class={cn("space-y-6", local.class)} 
      {...rest}
    >
      {(local.title || local.subtitle) && (
        <div class="space-y-2">
          {local.title && (
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {local.title}
            </h2>
          )}
          {local.subtitle && (
            <p class="text-gray-600 dark:text-gray-400">
              {local.subtitle}
            </p>
          )}
        </div>
      )}
      
      <div class="space-y-4">
        {local.children}
      </div>

      {local.actions && (
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {local.actions}
        </div>
      )}
    </form>
  );
};

export { FormLayout };
