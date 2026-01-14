import { Component, JSX, splitProps } from "solid-js";
import { Button } from "@/components/atoms/Button.tsx";
import { Spinner } from "@/components/atoms/Spinner.tsx";
import { cn } from "@/libs/cn.ts";

export interface SecondaryButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  class?: string;
}

const ButtonSecondary: Component<SecondaryButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["loading", "class", "children", "disabled"]);

  return (
    <Button
      {...rest}
      variant="outline"
      disabled={local.loading || local.disabled}
      class={cn("border-gray-300 text-gray-700 hover:bg-gray-50", local.class)}
    >
      {local.loading && (
        <Spinner size="sm" class="-ml-1 mr-3 text-gray-500" />
      )}
      {local.children}
    </Button>
  );
};

export { ButtonSecondary };
