import { Component, JSX, splitProps } from "solid-js";
import { cn } from "@/libs/cn.ts";

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: JSX.Element;
}

const Link: Component<LinkProps> = (props) => {
  const [local, rest] = splitProps(props, ["href", "children", "class"]);
  const isExternal = () => local.href.startsWith('http');
  
  return (
    <a
      href={local.href}
      target={isExternal() ? "_blank" : undefined}
      rel={isExternal() ? "noopener noreferrer" : undefined}
      class={cn(
        "text-primary underline-offset-4 hover:underline",
        local.class
      )}
      {...rest}
    >
      {local.children}
    </a>
  );
};

export default Link;
