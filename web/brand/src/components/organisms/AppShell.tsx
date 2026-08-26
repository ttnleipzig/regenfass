import type { JSX, ParentProps } from "solid-js";
import { Show } from "solid-js";
import { cn } from "../../libs/cn.ts";

export type AppShellProps = ParentProps<{
  header: JSX.Element;
  footer?: JSX.Element;
  mainClass?: string;
  class?: string;
}>;

/** Shared page frame used by the public web applications. */
export function AppShell(props: AppShellProps) {
  return (
    <div class={cn("min-h-screen flex flex-col", props.class)}>
      {props.header}
      <main class={cn("flex-1", props.mainClass)}>{props.children}</main>
      <Show when={props.footer}>{props.footer}</Show>
    </div>
  );
}
