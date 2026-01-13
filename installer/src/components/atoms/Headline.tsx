import { cn } from "@/libs/cn.ts";
import { JSX, Show, Switch, Match, splitProps } from "solid-js";

type HeadlineProps = {
  as?: "h1" | "h2" | "h3" | "h4";
  align?: "left" | "center" | "right";
  subtitle?: string;
  icon?: JSX.Element;
  class?: string;
  children: JSX.Element;
};

const sizeByAs: Record<NonNullable<HeadlineProps["as"]>, string> = {
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl sm:text-3xl",
  h3: "text-xl sm:text-2xl",
  h4: "text-lg sm:text-xl",
};

export function Headline(props: HeadlineProps) {
  const [local, rest] = splitProps(props, [
    "as",
    "align",
    "subtitle",
    "icon",
    "class",
    "children",
  ]);

  const tag = local.as ?? "h2";
  const alignClass =
    local.align === "center"
      ? "text-center"
      : local.align === "right"
      ? "text-right"
      : "text-left";

  const headlineClass = cn("font-bold tracking-tight", sizeByAs[tag], local.class);

  return (
    <div class={cn("space-y-1", alignClass)} {...rest}>
      <div class="inline-flex items-center gap-2">
        <Show when={local.icon}>
          <span class="text-foreground/80">{local.icon}</span>
        </Show>
        <Switch>
          <Match when={tag === "h1"}>
            <h1 class={headlineClass}>{local.children}</h1>
          </Match>
          <Match when={tag === "h2"}>
            <h2 class={headlineClass}>{local.children}</h2>
          </Match>
          <Match when={tag === "h3"}>
            <h3 class={headlineClass}>{local.children}</h3>
          </Match>
          <Match when={tag === "h4"}>
            <h4 class={headlineClass}>{local.children}</h4>
          </Match>
        </Switch>
      </div>
      <Show when={local.subtitle}>
        <p class="text-sm text-muted-foreground">{local.subtitle}</p>
      </Show>
    </div>
  );
}

export default Headline;


