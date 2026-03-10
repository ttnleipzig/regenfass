# Development Setup

## Prerequisites

Before setting up the Regenfass Installer development environment, ensure you have the following installed:

### Required Software

- **Node.js**: Version 18.0.0 or higher (LTS recommended)
- **pnpm**: Version 9.0.0 or higher (package manager)
- **Git**: Version 2.40.0 or higher
- **Modern Browser**: Chrome 89+, Edge 89+, or Opera 76+ (for Web Serial API)

### Recommended Tools

- **VS Code**: With SolidJS and TypeScript extensions
- **Chrome DevTools**: For debugging Web Serial API
- **Postman/Insomnia**: For testing GitHub API endpoints

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ttnleipzig/regenfass.git
cd regenfass/installer
```

### 2. Install Dependencies

```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Start Development Server

```bash
# Start development server with hot reload
pnpm dev

# The installer will be available at http://localhost:5173
```

### 4. Run Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm test:coverage

# Open test UI
pnpm test:ui
```

## Development Workflow

### Project Structure

```
installer/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── forms/          # Form-specific components
│   ├── installer/          # Core installer logic
│   │   ├── forms/          # Step-specific forms
│   │   ├── libs/           # Utility libraries
│   │   └── types.ts        # TypeScript definitions
│   ├── assets/             # Static assets
│   └── test/               # Test utilities
├── tests/                  # Main test directory
├── docs/                   # Documentation
├── public/                 # Public assets
├── package.json            # Dependencies and scripts
├── vite.config.ts         # Build configuration
├── tailwind.config.js     # Styling configuration
└── tsconfig.json          # TypeScript configuration
```

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:ui          # Interactive test interface
pnpm test:coverage    # Run tests with coverage

# Code Quality
pnpm lint             # Run linter (if configured)
pnpm format           # Format code (if configured)
```

## Configuration

### Environment Variables

Create a `.env.local` file in the installer directory:

```bash
# GitHub API Configuration
VITE_GITHUB_API_BASE_URL=https://api.github.com
VITE_GITHUB_REPO_OWNER=ttnleipzig
VITE_GITHUB_REPO_NAME=regenfass

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG_SERIAL=true
```

### TypeScript Configuration

The project uses TypeScript with strict mode enabled:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Vite Configuration

Key configuration for SolidJS and testing:

```typescript
export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## Development Practices

### Code Style

The project follows these conventions:

#### TypeScript

- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type, prefer `unknown` when necessary

```typescript
// Good
interface LoRaWANConfig {
  appEUI: string;
  appKey: string;
  devEUI: string;
}

function validateConfig(config: LoRaWANConfig): boolean {
  return isValidHex(config.appEUI, 16) && 
         isValidHex(config.appKey, 32) && 
         isValidHex(config.devEUI, 16);
}

// Avoid
function validateConfig(config: any) {
  // ...
}
```

#### SolidJS Components

- Use function components with proper TypeScript typing
- Prefer `createSignal` for local state
- Use `createMemo` for derived values
- Implement proper cleanup in `onCleanup`

```typescript
import { Component, createSignal, onCleanup } from "solid-js";

interface TextInputProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

const TextInput: Component<TextInputProps> = (props) => {
  const [inputId] = createSignal(`input-${Math.random().toString(36).slice(2)}`);
  
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    props.onChange?.(target.value);
  };

  return (
    <div class="space-y-1">
      {props.label && (
        <label for={inputId()} class="block text-sm font-medium">
          {props.label}
          {props.required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId()}
        type="text"
        value={props.value || ""}
        onInput={handleInput}
        required={props.required}
        class="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
};

export { TextInput };
```

#### CSS Classes

- Use TailwindCSS utility classes
- Create component variants with `class-variance-authority`
- Avoid custom CSS when possible

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### State Management

#### XState Integration

- Define state machines in separate files
- Use TypeScript for state and context types
- Implement proper error handling

```typescript
import { createMachine, assign } from "xstate";

interface InstallerContext {
  upstreamVersions: string[];
  selectedVersion?: string;
  error?: string;
}

type InstallerEvent = 
  | { type: "start.next" }
  | { type: "connect.retry" }
  | { type: "error"; message: string };

const installerMachine = createMachine<InstallerContext, InstallerEvent>({
  id: "installer",
  initial: "Start_WaitingForUser",
  context: {
    upstreamVersions: [],
  },
  states: {
    "Start_WaitingForUser": {
      on: {
        "start.next": "Connect_Connecting"
      }
    },
    "Connect_Connecting": {
      invoke: {
        src: "connectToDevice",
        onDone: "Connect_ReadingVersion",
        onError: {
          target: "Finish_ShowingError",
          actions: assign({
            error: (_, event) => event.data.message
          })
        }
      }
    }
  }
});
```

### Testing Practices

#### Test Structure

- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Group related tests with `describe` blocks

```typescript
describe("TextInput Component", () => {
  describe("Basic Rendering", () => {
    it("renders input field with label when provided", () => {
      // Arrange
      const label = "Email Address";
      
      // Act
      render(() => <TextInput label={label} />);
      
      // Assert
      expect(screen.getByLabelText(label)).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onChange handler when user types", () => {
      // Arrange
      const mockOnChange = vi.fn();
      render(() => <TextInput label="Email" onChange={mockOnChange} />);
      
      // Act
      const input = screen.getByLabelText("Email");
      fireEvent.input(input, { target: { value: "test@example.com" } });
      
      // Assert
      expect(mockOnChange).toHaveBeenCalledWith("test@example.com");
    });
  });
});
```

#### Mocking

- Mock external dependencies consistently
- Use factories for test data
- Clean up mocks after each test

```typescript
// Mock Web Serial API
const mockSerialAPI = () => {
  Object.defineProperty(window, "navigator", {
    value: {
      ...window.navigator,
      serial: {
        requestPort: vi.fn(),
        getPorts: vi.fn().mockResolvedValue([]),
      },
    },
    writable: true,
  });
};

// Test data factory
const createMockConfig = (overrides = {}) => ({
  appEUI: "0000000000000000",
  appKey: "00000000000000000000000000000000",
  devEUI: "0000000000000000",
  ...overrides,
});
```

## Debugging

### Browser DevTools

#### Web Serial API Debugging

1. Open Chrome DevTools
2. Go to Application tab
3. Check "Web Serial" under Storage for connected devices
4. Use Console for manual API testing:

```javascript
// Test serial support
console.log('Serial supported:', 'serial' in navigator);

// Request port manually
const port = await navigator.serial.requestPort();
console.log('Port info:', port.getInfo());
```

#### Network Debugging

Monitor GitHub API calls:

1. Open Network tab in DevTools
2. Filter by "Fetch/XHR"
3. Look for api.github.com requests
4. Check response status and data

### VS Code Debugging

#### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--inspect-brk"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### Recommended Extensions

- **SolidJS**: Syntax highlighting and IntelliSense
- **TypeScript Importer**: Auto-import organization
- **Tailwind CSS IntelliSense**: CSS class completion
- **Vitest**: Test runner integration

### Common Issues

#### Web Serial API Not Working

**Problem**: `navigator.serial` is undefined

**Solutions**:
1. Use Chrome, Edge, or Opera (not Firefox/Safari)
2. Serve over HTTPS or localhost
3. Check browser version (89+ required)

#### Build Errors

**Problem**: TypeScript compilation errors

**Solutions**:
1. Clear TypeScript cache: `rm -rf node_modules/.vite`
2. Restart TypeScript server in VS Code
3. Check `tsconfig.json` configuration

#### Test Failures

**Problem**: Tests fail in CI but pass locally

**Solutions**:
1. Check Node.js version compatibility
2. Verify all mocks are properly set up
3. Use `waitFor` for async operations

## Performance Optimization

### Bundle Analysis

```bash
# Build with bundle analysis
pnpm build

# Analyze bundle size
npx vite-bundle-analyzer dist
```

### Development Performance

- Use Vite's fast HMR for quick iteration
- Enable source maps for debugging
- Leverage browser caching for dependencies

### Memory Management

- Clean up event listeners in `onCleanup`
- Avoid memory leaks in state machines
- Use weak references for large objects

## Deployment

### Build Process

```bash
# Production build
pnpm build

# Preview build locally
pnpm preview
```

### Environment Configuration

Production environment variables:

```bash
VITE_GITHUB_API_BASE_URL=https://api.github.com
VITE_GITHUB_REPO_OWNER=ttnleipzig
VITE_GITHUB_REPO_NAME=regenfass
VITE_SENTRY_DSN=your-sentry-dsn
```

### Static File Serving

The built installer can be served from any static hosting:

- GitHub Pages
- Netlify
- Vercel
- S3 + CloudFront

Ensure HTTPS is enabled for Web Serial API functionality.

## Contributing

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit pull request with description

### Code Review Checklist

- [ ] Tests cover new functionality
- [ ] TypeScript types are properly defined
- [ ] Accessibility requirements met
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] No console errors or warnings

### Release Process

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Deploy to production
5. Monitor for issues

## Getting Help

### Resources

- **SolidJS Documentation**: https://www.solidjs.com/docs
- **Vitest Documentation**: https://vitest.dev
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **XState Documentation**: https://xstate.js.org/docs

### Support Channels

- **GitHub Issues**: For bug reports and feature requests
- **Team Chat**: For development questions
- **Code Reviews**: For architecture discussions

### FAQs

**Q: Why SolidJS instead of React?**
A: SolidJS provides better performance with fine-grained reactivity and smaller bundle size.

**Q: Can I use yarn instead of pnpm?**
A: The project is optimized for pnpm, but yarn should work. Update lockfile if switching.

**Q: How do I test Web Serial API locally?**
A: Use a supported browser over HTTPS or localhost. Mock the API for unit tests.