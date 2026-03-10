import { Component, JSX, splitProps } from "solid-js";
import { Button } from "@/components/atoms/Button.tsx";
import { Spinner } from "@/components/atoms/Spinner.tsx";
import { cn } from "@/libs/cn.ts";

export type ActionButtonType = "primary" | "secondary";

export interface ActionButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  // visual style
  type?: ActionButtonType;
  // native button type (submit/reset/button/menu)
  nativeType?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  loading?: boolean;
  class?: string;
}

export const ButtonAction: Component<ActionButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ["type", "nativeType", "loading", "class", "children", "disabled"]);

  const isPrimary = () => (local.type ?? "primary") === "primary";

  return (
    <Button
      {...rest}
      type={local.nativeType ?? "button"}
      variant={isPrimary() ? undefined : "outline"}
      disabled={local.loading || local.disabled}
      class={cn(
        isPrimary()
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "border-gray-300 text-gray-700 hover:bg-gray-50",
        local.class,
      )}
    >
      {local.loading && (
        <Spinner 
          size="sm" 
          class={cn(
            "-ml-1 mr-3",
            isPrimary() ? "text-white" : "text-gray-500",
          )}
        />
      )}
      {local.children}
    </Button>
  );
};

export default ButtonAction;

