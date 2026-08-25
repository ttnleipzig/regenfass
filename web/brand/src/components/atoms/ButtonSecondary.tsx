import { Component, JSX, splitProps } from "solid-js";
import { Button } from "./Button.tsx";
import { Spinner } from "./Spinner.tsx";
import { cn } from "../../libs/cn.ts";

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
      class={cn(
        // Brand teal outline — readable on light hero surfaces and dark chrome
        "border-secondary bg-background text-secondary hover:bg-secondary/10 hover:text-secondary active:bg-secondary/15 data-[pressed]:bg-secondary/15",
        local.class,
      )}
    >
      {local.loading && (
        <Spinner size="sm" class="-ml-1 mr-3 text-secondary" />
      )}
      {local.children}
    </Button>
  );
};

export { ButtonSecondary };
