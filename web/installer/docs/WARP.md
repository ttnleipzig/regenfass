# WARP Project Rules

This document contains project-specific rules for the Regenfass Installer project.

## Documentation Rules

### Language and Format

- **Language**: All documentation must be written in English
- **Format**: External documentation must be written in Markdown
- **Location**: Move Markdown files to appropriate directories

### Inline Documentation

- **TypeScript/JavaScript**: Use JSDoc-style inline documentation for all public classes, functions, and modules

Example:

```typescript path=null start=null
/**
 * Fetches user profile from the API
 * @param userId - unique identifier of the user
 * @returns User profile object
 * @throws Error if the user cannot be found
 */
async function getUser(userId: string): Promise<User> { ... }
```

## Code Standards

### Language Preference

- **Primary Language**: TypeScript is the preferred implementation language
- **Module System**: Use ES Modules (import/export)
- **TypeScript Config**: Enable strict mode
- **Type Safety**: Avoid `any`, prefer generics or `unknown`

### Code Style

- **Linting**: Code must follow TypeScript ESLint recommended rules
- **Formatting**: Code must be formatted with Prettier
- **Pre-commit**: Add a markdown linter that can automatically fix issues, with the fix step executed before every commit

## Git and Version Control

### Commit Messages

- **Standard**: All commits must follow the Conventional Commits specification

Examples:

```text
feat(auth): add JWT-based authentication
fix(ui): correct button alignment on mobile
chore(deps): update dependencies
```

### Editor Configuration

- **Git Editor**: vim is used as the default editor for git operations

## Typography

- **Ellipsis**: Always use the proper ellipsis character (…) instead of three periods (...)

## Date Format

- **Standard**: Format dates like `2021-05-12T14:48:04Z` to `12. Mai 2021`

## Project Structure

This is a TypeScript SolidJS project with the following key technologies:

- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Playwright
- **Package Manager**: pnpm

## Living Documentation

### Components Documentation

This project uses an automated living documentation system for components:

- **Generator**: `scripts/generate-components-doc.ts` analyzes TypeScript/TSX files
- **Output**: `docs/COMPONENTS.md` - automatically generated, do not edit manually
- **Triggers**:
  - Pre-build (`prebuild` script)
  - Pre-commit hook
  - Manual via `npm run docs:components`
  - Watch mode via `npm run docs:components:watch`

### Features

- **Component Discovery**: Automatically finds SolidJS components via type annotations and JSX patterns
- **Props Extraction**: Analyzes TypeScript interfaces for prop documentation
- **Dependencies**: Lists external packages and internal component relationships
- **Categories**: Organizes by Atomic Design principles (atoms, molecules, organisms, ui, forms)
- **JSDoc Support**: Extracts descriptions from JSDoc comments

### Maintenance

The documentation pipeline is maintained automatically through:

- Pre-commit hooks ensure docs are always up-to-date
- Markdown linting with auto-fix
- Conventional commits enforcement

## Process Diagrams

- **Tool**: Use drawio as the preferred tool for process diagrams
- **Reference**: Always consider and reference the Glossar when updating documentation rules

---

*This file should be updated as project-specific rules evolve.*
