export type ColorToken = { name: string; variable: string };
export type ColorTokenGroup = { title: string; tokens: readonly ColorToken[] };

export const COLOR_TOKEN_GROUPS: readonly ColorTokenGroup[] = [
  {
    title: "Surfaces & text",
    tokens: [
      { name: "Background", variable: "--background" },
      { name: "Foreground", variable: "--foreground" },
      { name: "Card", variable: "--card" },
      { name: "Card foreground", variable: "--card-foreground" },
      { name: "Popover", variable: "--popover" },
      { name: "Popover foreground", variable: "--popover-foreground" },
      { name: "Muted", variable: "--muted" },
      { name: "Muted foreground", variable: "--muted-foreground" },
      { name: "Accent", variable: "--accent" },
      { name: "Accent foreground", variable: "--accent-foreground" },
    ],
  },
  {
    title: "Interactive & feedback",
    tokens: [
      { name: "Primary", variable: "--primary" },
      { name: "Primary foreground", variable: "--primary-foreground" },
      { name: "Secondary", variable: "--secondary" },
      { name: "Secondary foreground", variable: "--secondary-foreground" },
      { name: "Destructive", variable: "--destructive" },
      { name: "Destructive foreground", variable: "--destructive-foreground" },
      { name: "Info", variable: "--info" },
      { name: "Info foreground", variable: "--info-foreground" },
      { name: "Warning", variable: "--warning" },
      { name: "Warning foreground", variable: "--warning-foreground" },
      { name: "Success", variable: "--success" },
      { name: "Success foreground", variable: "--success-foreground" },
    ],
  },
  {
    title: "Structure",
    tokens: [
      { name: "Border", variable: "--border" },
      { name: "Input", variable: "--input" },
      { name: "Ring", variable: "--ring" },
      { name: "Primary 500", variable: "--primary-500" },
    ],
  },
] as const;

export const FONT_TOKENS = [
  {
    name: "font-sans",
    label: "Sans",
    className: "font-sans",
    description: "Interface and body text",
    fallback: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  {
    name: "font-mono",
    label: "Mono",
    className: "font-mono",
    description: "Code, versions and technical values",
    fallback: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
] as const;

export const COLOR_TOKENS = COLOR_TOKEN_GROUPS.flatMap((group) => group.tokens);
