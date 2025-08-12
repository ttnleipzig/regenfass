import { Component, JSX } from "solid-js";

interface LinkProps {
  href: string;
  children: JSX.Element;
}

const Link: Component<LinkProps> = (props) => {
  const isExternal = () => props.href.startsWith('http');
  
  return (
    <a
      href={props.href}
      target={isExternal() ? "_blank" : undefined}
      rel={isExternal() ? "noopener noreferrer" : undefined}
      class="text-blue-600 hover:text-blue-800 underline"
    >
      {props.children}
    </a>
  );
};

export default Link;
