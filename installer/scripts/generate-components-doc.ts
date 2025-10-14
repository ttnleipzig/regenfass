#!/usr/bin/env tsx

import { Project, SourceFile, Node, SyntaxKind } from 'ts-morph';
import glob from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';

interface ComponentInfo {
  name: string;
  filePath: string;
  relativePath: string;
  category: string;
  description: string;
  props: PropInfo[];
  dependencies: {
    external: string[];
    internal: string[];
  };
}

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

class ComponentDocGenerator {
  private project: Project;
  private componentsRoot: string;
  private outputPath: string;
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
    this.componentsRoot = path.resolve(process.cwd(), 'src/components');
    this.outputPath = path.resolve(process.cwd(), 'docs/COMPONENTS.md');
    
    // Initialize ts-morph project
    this.project = new Project({
      tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    });
  }

  private log(message: string) {
    if (this.debug) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  }

  /**
   * Discover all component files
   */
  private async discoverComponents(): Promise<string[]> {
    const pattern = path.join(this.componentsRoot, '**/*.{ts,tsx}');
    const files = await glob(pattern, {
      ignore: ['**/*.test.*', '**/__tests__/**'],
    });
    
    this.log(`Found ${files.length} component files`);
    return files;
  }

  /**
   * Extract component information from a source file
   */
  private extractComponentInfo(sourceFile: SourceFile): ComponentInfo[] {
    const components: ComponentInfo[] = [];
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(this.componentsRoot, filePath);
    
    // Get category from the first path segment
    const pathSegments = relativePath.split(path.sep);
    const category = this.categorizeComponent(pathSegments[0]);

    this.log(`Processing file: ${relativePath}`);

    // Find exported components
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    
    for (const [exportName, declarations] of exportedDeclarations) {
      for (const declaration of declarations) {
        if (this.isComponentDeclaration(declaration)) {
          const componentInfo = this.extractComponentDetails(
            declaration,
            exportName,
            filePath,
            relativePath,
            category,
            sourceFile
          );
          
          if (componentInfo) {
            components.push(componentInfo);
            this.log(`Found component: ${componentInfo.name}`);
          }
        }
      }
    }

    return components;
  }

  /**
   * Check if a declaration is a SolidJS component
   */
  private isComponentDeclaration(node: Node): boolean {
    // Check for variable declaration with Component<Props> type annotation
    if (Node.isVariableDeclaration(node)) {
      const typeNode = node.getTypeNode();
      if (typeNode && typeNode.getText().includes('Component')) {
        return true;
      }
      
      // Check initializer for arrow function returning JSX
      const initializer = node.getInitializer();
      if (Node.isArrowFunction(initializer) && this.returnsJSX(initializer)) {
        return true;
      }
    }
    
    // Check for function declaration returning JSX
    if (Node.isFunctionDeclaration(node) && this.returnsJSX(node)) {
      return true;
    }

    // Check for @component JSDoc tag
    try {
      const jsDocs = Node.isFunctionDeclaration(node) || Node.isVariableDeclaration(node) ? node.getJsDocs() : [];
      for (const jsDoc of jsDocs) {
        const tags = jsDoc.getTags();
        if (tags.some(tag => tag.getTagName() === 'component')) {
          return true;
        }
      }
    } catch {
      // Ignore JSDoc errors
    }

    return false;
  }

  /**
   * Check if function returns JSX
   */
  private returnsJSX(node: Node): boolean {
    if (Node.isFunctionDeclaration(node) || Node.isArrowFunction(node)) {
      const returnType = node.getReturnType();
      const returnTypeText = returnType.getText();
      return returnTypeText.includes('JSX') || returnTypeText.includes('Element');
    }
    return false;
  }

  /**
   * Extract detailed component information
   */
  private extractComponentDetails(
    node: Node,
    exportName: string,
    filePath: string,
    relativePath: string,
    category: string,
    sourceFile: SourceFile
  ): ComponentInfo | null {
    try {
      const name = exportName === 'default' ? this.getDefaultExportName(relativePath) : exportName;
      const description = this.extractDescription(node, sourceFile);
      const props = this.extractProps(node);
      const dependencies = this.extractDependencies(sourceFile);

      return {
        name,
        filePath,
        relativePath,
        category,
        description,
        props,
        dependencies,
      };
    } catch (error) {
      this.log(`Error extracting component details: ${error}`);
      return null;
    }
  }

  /**
   * Get default export name from filename
   */
  private getDefaultExportName(relativePath: string): string {
    const filename = path.basename(relativePath, path.extname(relativePath));
    return filename.charAt(0).toUpperCase() + filename.slice(1);
  }

  /**
   * Extract component description from JSDoc
   */
  private extractDescription(node: Node, sourceFile: SourceFile): string {
    // Try to get JSDoc from the component declaration
    try {
      if (Node.isFunctionDeclaration(node) || Node.isVariableDeclaration(node)) {
        const jsDocs = node.getJsDocs();
        if (jsDocs.length > 0) {
          const description = jsDocs[0].getDescription().trim();
          if (description) {
            return description.split('\n')[0]; // First paragraph only
          }
        }
      }
    } catch {
      // Ignore JSDoc errors
    }

    // Fallback to file-level JSDoc
    try {
      const fileJsDocs = sourceFile.getLeadingCommentRanges();
      for (const comment of fileJsDocs) {
        const commentText = comment.getText();
        if (commentText.startsWith('/**')) {
          const lines = commentText.split('\n');
          for (const line of lines) {
            const clean = line.replace(/^\s*\*\s?/, '').trim();
            if (clean && !clean.startsWith('@')) {
              return clean;
            }
          }
        }
      }
    } catch {
      // Ignore comment errors
    }

    return '';
  }

  /**
   * Extract props information
   */
  private extractProps(node: Node): PropInfo[] {
    const props: PropInfo[] = [];

    try {
      // Find the props parameter
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

      // Get the type of the props parameter
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
    } catch (error) {
      this.log(`Error extracting props: ${error}`);
    }

    return props;
  }

  /**
   * Extract individual prop information
   */
  private extractPropInfo(property: Node, propsParameter: Node): PropInfo | null {
    if (!Node.isPropertySignature(property)) {
      return null;
    }

    try {
      const name = property.getName();
      const isOptional = property.hasQuestionToken();
      const required = !isOptional;
      
      // Get type
      const typeNode = property.getTypeNode();
      const type = typeNode ? typeNode.getText() : property.getType().getText(property);
      
      // Clean up type text
      const cleanType = type
        .replace(/import\([^)]+\)\./g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Get default value from parameter destructuring
      let defaultValue: string | undefined;
      if (Node.isParameter(propsParameter)) {
        const bindingName = propsParameter.getNameNode();
        if (Node.isObjectBindingPattern(bindingName)) {
          const elements = bindingName.getElements();
          for (const element of elements) {
            if (Node.isBindingElement(element)) {
              const elementName = element.getNameNode();
              if (Node.isIdentifier(elementName) && elementName.getText() === name) {
                const initializer = element.getInitializer();
                if (initializer) {
                  defaultValue = initializer.getText();
                }
              }
            }
          }
        }
      }

      // Get description from JSDoc
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

      return {
        name,
        type: cleanType,
        required,
        defaultValue,
        description,
      };
    } catch (error) {
      this.log(`Error extracting prop info: ${error}`);
      return null;
    }
  }

  /**
   * Extract dependencies from imports
   */
  private extractDependencies(sourceFile: SourceFile) {
    const external: string[] = [];
    const internal: string[] = [];

    const imports = sourceFile.getImportDeclarations();
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      if (moduleSpecifier.startsWith('.')) {
        // Internal dependency
        const resolvedPath = path.resolve(path.dirname(sourceFile.getFilePath()), moduleSpecifier);
        const relativePath = path.relative(this.componentsRoot, resolvedPath);
        
        if (relativePath.startsWith('../')) {
          // Outside components directory, ignore
          continue;
        }
        
        internal.push(relativePath.replace(/\.tsx?$/, ''));
      } else if (!moduleSpecifier.startsWith('node:')) {
        // External dependency
        const packageName = moduleSpecifier.split('/')[0];
        if (packageName.startsWith('@')) {
          external.push(moduleSpecifier.split('/').slice(0, 2).join('/'));
        } else {
          external.push(packageName);
        }
      }
    }

    return {
      external: [...new Set(external)].sort(),
      internal: [...new Set(internal)].sort(),
    };
  }

  /**
   * Categorize component based on directory structure
   */
  private categorizeComponent(firstPathSegment: string): string {
    const knownCategories = ['atoms', 'molecules', 'organisms', 'ui', 'forms'];
    return knownCategories.includes(firstPathSegment) ? firstPathSegment : 'uncategorized';
  }

  /**
   * Generate the markdown documentation
   */
  private generateMarkdown(components: ComponentInfo[]): string {
    const groupedComponents = this.groupComponentsByCategory(components);
    const categories = ['atoms', 'molecules', 'organisms', 'ui', 'forms', 'uncategorized'];
    
    let markdown = `# Components Documentation

This document contains automatically generated documentation for all components in the installer application.

> **Note**: This file is auto-generated. Do not edit manually.

## Table of Contents

`;

    // Generate table of contents
    for (const category of categories) {
      if (groupedComponents[category] && groupedComponents[category].length > 0) {
        const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
        markdown += `- [${categoryTitle}](#${category})\n`;
        
        for (const component of groupedComponents[category]) {
          markdown += `  - [${component.name}](#${component.name.toLowerCase()})\n`;
        }
      }
    }

    markdown += '\n';

    // Generate sections
    for (const category of categories) {
      if (groupedComponents[category] && groupedComponents[category].length > 0) {
        const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
        markdown += `## ${categoryTitle}\n\n`;
        
        const sortedComponents = groupedComponents[category].sort((a, b) => a.name.localeCompare(b.name));
        
        for (const component of sortedComponents) {
          markdown += this.generateComponentMarkdown(component);
        }
      }
    }

    markdown += `\n---

*Generated on ${new Date().toLocaleString('de-DE', { 
  day: '2-digit', 
  month: 'long', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}*\n`;

    return markdown;
  }

  /**
   * Group components by category
   */
  private groupComponentsByCategory(components: ComponentInfo[]): Record<string, ComponentInfo[]> {
    const grouped: Record<string, ComponentInfo[]> = {};
    
    for (const component of components) {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category].push(component);
    }
    
    return grouped;
  }

  /**
   * Generate markdown for a single component
   */
  private generateComponentMarkdown(component: ComponentInfo): string {
    let markdown = `### ${component.name}\n\n`;
    
    // Path and description
    markdown += `**Path**: \`${component.relativePath}\`\n\n`;
    
    if (component.description) {
      markdown += `${component.description}\n\n`;
    }

    // Props table
    if (component.props.length > 0) {
      markdown += `**Props:**\n\n`;
      markdown += `| Prop | Type | Required | Default | Description |\n`;
      markdown += `|------|------|----------|---------|-------------|\n`;
      
      for (const prop of component.props) {
        const required = prop.required ? '✅' : '❌';
        const defaultValue = prop.defaultValue || '-';
        const description = prop.description || '-';
        
        markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${required} | \`${defaultValue}\` | ${description} |\n`;
      }
      markdown += '\n';
    }

    // Dependencies
    if (component.dependencies.external.length > 0 || component.dependencies.internal.length > 0) {
      markdown += `**Dependencies:**\n\n`;
      
      if (component.dependencies.external.length > 0) {
        markdown += `*External:*\n`;
        for (const dep of component.dependencies.external) {
          markdown += `- \`${dep}\`\n`;
        }
        markdown += '\n';
      }
      
      if (component.dependencies.internal.length > 0) {
        markdown += `*Internal:*\n`;
        for (const dep of component.dependencies.internal) {
          markdown += `- \`${dep}\`\n`;
        }
        markdown += '\n';
      }
    }

    // Import example
    const importPath = component.relativePath.replace(/\.tsx?$/, '').replace(/\/index$/, '');
    markdown += `**Import:**\n\`\`\`typescript\nimport { ${component.name} } from '@/components/${importPath}';\n\`\`\`\n\n`;

    return markdown;
  }

  /**
   * Write markdown to file if content changed
   */
  private async writeMarkdown(content: string): Promise<boolean> {
    try {
      // Check if content changed
      if (fs.existsSync(this.outputPath)) {
        const existingContent = fs.readFileSync(this.outputPath, 'utf8');
        if (existingContent === content) {
          this.log('No changes detected, skipping write');
          return false;
        }
      }

      // Ensure directory exists
      fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
      
      // Write file
      fs.writeFileSync(this.outputPath, content, 'utf8');
      console.log(`✅ Documentation generated: ${this.outputPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to write documentation: ${error}`);
      return false;
    }
  }

  /**
   * Generate documentation
   */
  async generate(): Promise<void> {
    try {
      console.log('🔍 Discovering components…');
      const componentFiles = await this.discoverComponents();
      
      if (componentFiles.length === 0) {
        console.log('⚠️  No component files found');
        return;
      }

      console.log('📖 Analyzing components…');
      const allComponents: ComponentInfo[] = [];
      
      for (const filePath of componentFiles) {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        const components = this.extractComponentInfo(sourceFile);
        allComponents.push(...components);
      }

      if (allComponents.length === 0) {
        console.log('⚠️  No components found');
        return;
      }

      console.log(`📝 Generating documentation for ${allComponents.length} components…`);
      const markdown = this.generateMarkdown(allComponents);
      await this.writeMarkdown(markdown);
      
    } catch (error) {
      console.error('❌ Error generating documentation:', error);
      process.exit(1);
    }
  }

  /**
   * Watch for changes and regenerate
   */
  async watch(): Promise<void> {
    console.log('👀 Watching for changes…');
    
    let debounceTimer: NodeJS.Timeout;
    
    const watcher = chokidar.watch(
      path.join(this.componentsRoot, '**/*.{ts,tsx}'),
      {
        ignored: ['**/*.test.*', '**/__tests__/**'],
        persistent: true,
      }
    );

    const regenerate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log('🔄 Regenerating documentation…');
        this.generate();
      }, 300);
    };

    watcher
      .on('add', (path) => {
        console.log(`➕ Added: ${path}`);
        regenerate();
      })
      .on('change', (path) => {
        console.log(`📝 Changed: ${path}`);
        regenerate();
      })
      .on('unlink', (path) => {
        console.log(`➖ Removed: ${path}`);
        regenerate();
      });

    // Generate initial documentation
    await this.generate();
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watcher…');
      watcher.close();
      process.exit(0);
    });
  }
}

// CLI handling
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const debugMode = args.includes('--debug');

const generator = new ComponentDocGenerator(debugMode);

if (watchMode) {
  generator.watch();
} else {
  generator.generate();
}