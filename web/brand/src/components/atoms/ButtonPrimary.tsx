import { Component, JSX, splitProps } from "solid-js";
import { Button } from "./Button.tsx";
import { Spinner } from "./Spinner.tsx";
import { cn } from "../../libs/cn.ts";

export interface PrimaryButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  class?: string;
}

const ButtonPrimary: Component<PrimaryButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["loading", "class", "children", "disabled"]);

  return (
    <Button
      {...rest}
      disabled={local.loading || local.disabled}
      class={cn("bg-blue-600 hover:bg-blue-700 text-white", local.class)}
    >
      {local.loading && (
        <Spinner size="sm" class="-ml-1 mr-3 text-white" />
      )}
      {local.children}
    </Button>
  );
};

export { ButtonPrimary };
