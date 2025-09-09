import { cn } from "@/libs/cn";
import { JSX, Show, splitProps } from "solid-js";

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

  const Tag = (local.as ?? "h2") as keyof JSX.IntrinsicElements;
  const alignClass =
    local.align === "center"
      ? "text-center"
      : local.align === "right"
      ? "text-right"
      : "text-left";

  return (
    <div class={cn("space-y-1", alignClass)} {...rest}>
      <div class="inline-flex items-center gap-2">
        <Show when={local.icon}>{(icon) => <span class="text-foreground/80">{icon()}</span>}</Show>
        <Tag class={cn("font-bold tracking-tight", sizeByAs[(local.as ?? "h2")], local.class)}>
          {local.children}
        </Tag>
      </div>
      <Show when={local.subtitle}>
        <p class="text-sm text-muted-foreground">{local.subtitle}</p>
      </Show>
    </div>
  );
}

export default Headline;


