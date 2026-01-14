#!/usr/bin/env tsx

import { Project, SourceFile, Node, SyntaxKind } from 'ts-morph';
import glob from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs';
import { info, success, warn, error, header, endGroup, stat } from './misc-cli-utils.mjs';

interface PlaygroundComponent {
  name: string;
  filePath: string;
  relativePath: string;
  category: string;
  description: string;
  props: PropInfo[];
  examples: ComponentExample[];
  importPath: string;
}

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
  controlType: 'text' | 'boolean' | 'number' | 'select' | 'color';
  options?: string[];
}

interface ComponentExample {
  name: string;
  description: string;
  props: Record<string, any>;
  code: string;
}

class PlaygroundRegistryGenerator {
  private project: Project;
  private componentsRoot: string;
  private outputPath: string;

  constructor() {
    this.componentsRoot = path.resolve(process.cwd(), 'src/components');
    this.outputPath = path.resolve(process.cwd(), 'src/playground/registry.json');

    this.project = new Project({
      tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    });
  }

  private async discoverComponents(): Promise<string[]> {
    const pattern = path.join(this.componentsRoot, '**/*.{ts,tsx}');
    const files = await glob(pattern, {
      ignore: ['**/*.test.*', '**/__tests__/**'],
    });
    return files;
  }

  private isComponentDeclaration(node: Node): boolean {
    if (Node.isVariableDeclaration(node)) {
      const typeNode = node.getTypeNode();
      if (typeNode && typeNode.getText().includes('Component')) {
        return true;
      }

      const initializer = node.getInitializer();
      if (Node.isArrowFunction(initializer) && this.returnsJSX(initializer)) {
        return true;
      }
    }

    if (Node.isFunctionDeclaration(node) && this.returnsJSX(node)) {
      return true;
    }

    return false;
  }

  private returnsJSX(node: Node): boolean {
    if (Node.isFunctionDeclaration(node) || Node.isArrowFunction(node)) {
      // Prefer structural detection of JSX in the function body
      const hasJsx =
        node.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
        node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
        node.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0;
      if (hasJsx) return true;

      // Fallback to return type text heuristic
      try {
        const returnType = node.getReturnType();
        const returnTypeText = returnType.getText();
        return returnTypeText.includes('JSX') || returnTypeText.includes('Element');
      } catch {
        return false;
      }
    }
    return false;
  }

  private categorizeComponent(firstPathSegment: string): string {
    const knownCategories = ['atoms', 'molecules', 'organisms', 'ui', 'forms'];
    return knownCategories.includes(firstPathSegment) ? firstPathSegment : 'uncategorized';
  }

  private extractProps(node: Node): PropInfo[] {
    const props: PropInfo[] = [];

    try {
      let propsParameter: Node | undefined;

      if (Node.isFunctionDeclaration(node)) {
        propsParameter = node.getParameters()[0];
      } else if (Node.isVariableDeclaration(node)) {
        const initializer = node.getInitializer();
        if (Node.isArrowFunction(initializer)) {
          propsParameter = initializer.getParameters()[0];
        }
      }

      if (!propsParameter) {
        return props;
      }

      const propsType = propsParameter.getType();
      const propsSymbol = propsType.getSymbol();

      if (propsSymbol) {
        const declarations = propsSymbol.getDeclarations();

        for (const declaration of declarations) {
          if (Node.isInterfaceDeclaration(declaration) || Node.isTypeLiteralNode(declaration)) {
            const properties = Node.isInterfaceDeclaration(declaration)
              ? declaration.getProperties()
              : declaration.getProperties();

            for (const property of properties) {
              if (Node.isPropertySignature(property)) {
                const propInfo = this.extractPropInfo(property, propsParameter);
                if (propInfo) {
                  props.push(propInfo);
                }
              }
            }
          }
        }
      }
      } catch (err) {
      warn(`Error extracting props: ${err}`, 'Props Extraction');
    }

    return props;
  }

  private extractPropInfo(property: Node, propsParameter: Node): PropInfo | null {
    if (!Node.isPropertySignature(property)) {
      return null;
    }

    try {
      const name = property.getName();
      const isOptional = property.hasQuestionToken();
      const required = !isOptional;

      const typeNode = property.getTypeNode();
      const type = typeNode ? typeNode.getText() : property.getType().getText(property);

      const cleanType = type
        .replace(/import\([^)]+\)\./g, '')
        .replace(/\s+/g, ' ')
        .trim();

      let defaultValue: string | undefined;
      // Skip parameter destructuring analysis for now to avoid API issues
      // TODO: Implement proper parameter destructuring analysis

      let description = '';
      try {
        if (Node.isPropertySignature(property)) {
          const jsDocs = property.getJsDocs();
          if (jsDocs.length > 0) {
            description = jsDocs[0].getDescription().trim();
          }
        }
      } catch {
        // Ignore JSDoc errors
      }

      // Determine control type based on TypeScript type
      const controlType = this.getControlType(cleanType);
      const options = this.getTypeOptions(cleanType);

      return {
        name,
        type: cleanType,
        required,
        defaultValue,
        description,
        controlType,
        options,
      };
    } catch (err) {
      warn(`Error extracting prop info: ${err}`, 'Prop Info');
      return null;
    }
  }

  private getControlType(type: string): PropInfo['controlType'] {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('boolean')) {
      return 'boolean';
    }
    if (normalizedType.includes('number')) {
      return 'number';
    }
    if (normalizedType.includes('|') && !normalizedType.includes('undefined')) {
      return 'select';
    }
    if (normalizedType.includes('color')) {
      return 'color';
    }
    return 'text';
  }

  private getTypeOptions(type: string): string[] | undefined {
    // Extract union type options
    if (type.includes('|')) {
      const options = type
        .split('|')
        .map(opt => opt.trim().replace(/['"]/g, ''))
        .filter(opt => opt !== 'undefined' && opt !== 'null');

      if (options.length > 1 && options.every(opt => opt.match(/^[a-zA-Z0-9_-]+$/))) {
        return options;
      }
    }
    return undefined;
  }

  private generateExamples(componentName: string, props: PropInfo[]): ComponentExample[] {
    const examples: ComponentExample[] = [];

    // Default example
    const defaultProps: Record<string, any> = {};
    props.forEach(prop => {
      if (prop.defaultValue) {
        defaultProps[prop.name] = prop.defaultValue.replace(/['"]/g, '');
      } else if (prop.required) {
        // Generate reasonable defaults for required props
        switch (prop.controlType) {
          case 'boolean':
            defaultProps[prop.name] = false;
            break;
          case 'number':
            defaultProps[prop.name] = 0;
            break;
          case 'select':
            defaultProps[prop.name] = prop.options?.[0] || '';
            break;
          default:
            defaultProps[prop.name] = `Example ${prop.name}`;
        }
      }
    });

    examples.push({
      name: 'Default',
      description: 'Default component appearance',
      props: defaultProps,
      code: this.generateCodeExample(componentName, defaultProps),
    });

    // Generate additional examples based on component name patterns
    if (componentName.toLowerCase().includes('button')) {
      examples.push({
        name: 'Loading',
        description: 'Button in loading state',
        props: { ...defaultProps, loading: true },
        code: this.generateCodeExample(componentName, { ...defaultProps, loading: true }),
      });
    }

    if (componentName.toLowerCase().includes('input')) {
      examples.push({
        name: 'With Error',
        description: 'InputField with validation error',
        props: { ...defaultProps, error: 'This field is required' },
        code: this.generateCodeExample(componentName, { ...defaultProps, error: 'This field is required' }),
      });
    }

    return examples;
  }

  private generateCodeExample(componentName: string, props: Record<string, any>): string {
    const propsString = Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        if (typeof value === 'number') {
          return `${key}={${value}}`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(' ');

    return `<${componentName}${propsString ? ' ' + propsString : ''} />`;
  }

  private extractComponentInfo(sourceFile: SourceFile): PlaygroundComponent[] {
    const components: PlaygroundComponent[] = [];
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(this.componentsRoot, filePath);

    const pathSegments = relativePath.split(path.sep);
    const category = this.categorizeComponent(pathSegments[0]);

    const exportedDeclarations = sourceFile.getExportedDeclarations();

    for (const [exportName, declarations] of exportedDeclarations) {
      for (const declaration of declarations) {
        if (this.isComponentDeclaration(declaration)) {
          const name = exportName === 'default' ? this.getDefaultExportName(relativePath) : exportName;

          let description = '';
          try {
            if (Node.isFunctionDeclaration(declaration) || Node.isVariableDeclaration(declaration)) {
              const jsDocs = declaration.getJsDocs();
              if (jsDocs.length > 0) {
                description = jsDocs[0].getDescription().trim();
              }
            }
          } catch {
            // Ignore JSDoc errors
          }

          const props = this.extractProps(declaration);
          const examples = this.generateExamples(name, props);
          const importPath = `@/components/${relativePath.replace(/\.tsx?$/, '').replace(/\/index$/, '')}`;

          components.push({
            name,
            filePath,
            relativePath,
            category,
            description,
            props,
            examples,
            importPath,
          });
        }
      }
    }

    return components;
  }

  private getDefaultExportName(relativePath: string): string {
    const filename = path.basename(relativePath, path.extname(relativePath));
    return filename.charAt(0).toUpperCase() + filename.slice(1);
  }

  async generate(): Promise<void> {
    try {
      header('Playground Registry Generator', 'Discovering and analyzing components for playground');
      info('Discovering components for playground…');
      const componentFiles = await this.discoverComponents();

      if (componentFiles.length === 0) {
        warn('No component files found');
        endGroup();
        return;
      }

      info(`Found ${componentFiles.length} component files`);
      info('Analyzing components…');
      const allComponents: PlaygroundComponent[] = [];

      for (const filePath of componentFiles) {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        const components = this.extractComponentInfo(sourceFile);
        allComponents.push(...components);
      }

      if (allComponents.length === 0) {
        warn('No components found');
        endGroup();
        return;
      }

      // Group by category
      const registry = {
        atoms: allComponents.filter(c => c.category === 'atoms'),
        molecules: allComponents.filter(c => c.category === 'molecules'),
        organisms: allComponents.filter(c => c.category === 'organisms'),
        ui: allComponents.filter(c => c.category === 'ui'),
        forms: allComponents.filter(c => c.category === 'forms'),
        uncategorized: allComponents.filter(c => c.category === 'uncategorized'),
      };

      // Ensure output directory exists
      fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });

      // Write registry file
      fs.writeFileSync(this.outputPath, JSON.stringify(registry, null, 2), 'utf8');

      // Also copy to public directory for development
      const publicPath = path.resolve(process.cwd(), 'public/registry.json');
      fs.writeFileSync(publicPath, JSON.stringify(registry, null, 2), 'utf8');

      success(`Playground registry generated: ${this.outputPath}`);
      success(`Registry copied to public: ${publicPath}`);
      stat('Components found', allComponents.length);
      stat('Categories', Object.keys(registry).length);
      endGroup();

    } catch (err) {
      error(`Error generating playground registry: ${err}`);
      endGroup();
      process.exit(1);
    }
  }
}

const generator = new PlaygroundRegistryGenerator();
generator.generate();
