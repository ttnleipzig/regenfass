export interface PlaygroundComponent {
  name: string;
  filePath: string;
  relativePath: string;
  category: string;
  description: string;
  props: PropInfo[];
  examples: ComponentExample[];
  importPath: string;
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
  controlType: 'text' | 'boolean' | 'number' | 'select' | 'color';
  options?: string[];
}

export interface ComponentExample {
  name: string;
  description: string;
  props: Record<string, any>;
  code: string;
}

export interface PlaygroundRegistry {
  atoms: PlaygroundComponent[];
  molecules: PlaygroundComponent[];
  organisms: PlaygroundComponent[];
  ui: PlaygroundComponent[];
  forms: PlaygroundComponent[];
  uncategorized: PlaygroundComponent[];
}

export type ComponentCategory = keyof PlaygroundRegistry;