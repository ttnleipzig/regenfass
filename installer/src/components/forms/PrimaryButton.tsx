import { Component, JSX, splitProps } from "solid-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/cn";

export interface PrimaryButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  class?: string;
}

const PrimaryButton: Component<PrimaryButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["loading", "class", "children", "disabled"]);

  return (
    <Button
      {...rest}
      disabled={local.loading || local.disabled}
      class={cn("bg-blue-600 hover:bg-blue-700 text-white", local.class)}
    >
      {local.loading && (
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {local.children}
    </Button>
  );
};

export { PrimaryButton };
