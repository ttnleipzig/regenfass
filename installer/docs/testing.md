# Testing Strategy

## Overview

The Regenfass Installer uses Vitest as the primary testing framework with comprehensive unit, integration, and end-to-end testing coverage. Our testing strategy ensures reliability, maintainability, and user confidence in the installation process.

## Testing Framework Stack

### Core Testing Tools

- **Vitest 3.2+**: Fast unit test runner with native ES modules support
- **@solidjs/testing-library**: SolidJS-specific testing utilities
- **@testing-library/jest-dom**: Additional DOM matchers
- **jsdom**: Browser environment simulation
- **Vitest UI**: Interactive test interface

### Coverage Tools

- **c8/V8**: Built-in code coverage provider
- **Coverage reporters**: Text, JSON, HTML formats
- **Coverage thresholds**: Minimum 80% across all metrics

## Test Organization

### Directory Structure

```
installer/
├── tests/                          # Main test directory
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── *.test.tsx                 # Test files
├── src/test/                      # Legacy test files (being migrated)
│   ├── setup.ts                  # Test environment setup
│   ├── components/               # Component tests
│   └── forms/                    # Form tests
└── vitest.config.ts              # Test configuration
```

### Test File Naming

- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature-integration.test.tsx`
- Utilities: `utils.test.ts`

## Testing Approaches

### Unit Testing

Focus on individual components and functions in isolation.

#### What to Test

- **Component rendering**: Correct output for given props
- **User interactions**: Click, input, form submission
- **Props handling**: Default values, prop validation
- **State changes**: Local component state updates
- **Event callbacks**: Function calls with correct arguments

#### Example Unit Test

```typescript
describe("TextInput Component", () => {
  it("renders with label and validates required input", () => {
    const mockOnChange = vi.fn();
    
    render(() => (
      <TextInput 
        label="Email" 
        required 
        onChange={mockOnChange} 
      />
    ));
    
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    
    fireEvent.input(input, { target: { value: "test@example.com" } });
    expect(mockOnChange).toHaveBeenCalled();
  });
});
```

### Integration Testing

Test component interactions and complete user workflows.

#### What to Test

- **Multi-step workflows**: Complete installation process
- **State machine transitions**: State changes and side effects
- **API integrations**: GitHub API, Web Serial API
- **Error handling**: Recovery from various error states
- **Data persistence**: Configuration management

#### Example Integration Test

```typescript
describe("Installation Workflow", () => {
  it("completes full installation from start to finish", async () => {
    const mockSerial = setupMockSerialAPI();
    const mockGitHub = setupMockGitHubAPI();
    
    render(() => <InstallerRoot />);
    
    // Start phase
    await waitFor(() => {
      expect(screen.getByText("Willkommen")).toBeInTheDocument();
    });
    
    // Proceed through workflow...
    const startButton = screen.getByText("Installation starten");
    fireEvent.click(startButton);
    
    // Assert state transitions and UI updates
    await waitFor(() => {
      expect(screen.getByText("Installation abgeschlossen")).toBeInTheDocument();
    });
  });
});
```

## Mocking Strategy

### Web APIs

Mock browser APIs that aren't available in jsdom:

```typescript
// Mock Web Serial API
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

// Mock File API
global.FileReader = class {
  readAsText = vi.fn();
  onload = vi.fn();
  onerror = vi.fn();
};
```

### Network Requests

Mock fetch for GitHub API calls:

```typescript
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('github.com/repos')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { tag_name: 'v1.0.0' },
        { tag_name: 'v1.1.0' }
      ])
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});
```

### XState Machines

Mock state machines for isolated component testing:

```typescript
const mockStateMachine = {
  send: vi.fn(),
  state: { value: 'Start_WaitingForUser' },
  context: {
    upstreamVersions: ['1.0.0', '1.1.0'],
    configuration: {}
  }
};
```

## Coverage Requirements

### Minimum Thresholds

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
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

### Coverage Exclusions

Files excluded from coverage requirements:

- Type definition files (`*.d.ts`)
- Configuration files (`*.config.*`)
- Test files themselves
- Third-party dependencies
- Development utilities

## Test Data Management

### Fixtures

Common test data stored in reusable fixtures:

```typescript
// test/fixtures/configuration.ts
export const validLoRaWANConfig = {
  appEUI: "0000000000000000",
  appKey: "00000000000000000000000000000000", 
  devEUI: "0000000000000000",
  firmwareVersion: "1.0.0"
};

export const invalidConfigs = [
  { appEUI: "invalid", appKey: "valid32char", devEUI: "valid16char" },
  { appEUI: "toolong17chars", appKey: "valid32char", devEUI: "valid16char" }
];
```

### Factories

Generate dynamic test data:

```typescript
export const createMockDevice = (overrides = {}) => ({
  vendorId: 0x1234,
  productId: 0x5678,
  firmwareVersion: "1.0.0",
  ...overrides
});
```

## Error Testing

### Error Scenarios

Test all possible error conditions:

- **Network errors**: GitHub API failures, timeouts
- **Device errors**: Connection failures, incompatible devices
- **User errors**: Invalid input, missing required fields
- **System errors**: Browser incompatibility, permissions

### Error Test Examples

```typescript
describe("Error Handling", () => {
  it("displays meaningful error for unsupported browser", () => {
    // Mock unsupported browser
    delete (window.navigator as any).serial;
    
    render(() => <InstallerRoot />);
    
    expect(screen.getByText(/Browser unterstützt.*Web Serial API nicht/))
      .toBeInTheDocument();
  });
  
  it("handles device connection timeout", async () => {
    const mockPort = {
      open: vi.fn().mockRejectedValue(new Error("Timeout"))
    };
    
    (navigator.serial.requestPort as any).mockResolvedValue(mockPort);
    
    // Test connection attempt
    // Assert error handling
  });
});
```

## Performance Testing

### Loading Performance

Test that components render efficiently:

```typescript
describe("Performance", () => {
  it("renders large firmware version list efficiently", () => {
    const manyVersions = Array.from({ length: 100 }, (_, i) => `1.${i}.0`);
    
    const renderTime = performance.now();
    render(() => <StepStartWaitingForUserForm upstreamVersions={manyVersions} />);
    const duration = performance.now() - renderTime;
    
    expect(duration).toBeLessThan(100); // Should render in under 100ms
  });
});
```

### Memory Testing

Verify no memory leaks in long-running processes:

```typescript
it("cleans up resources on component unmount", () => {
  const { unmount } = render(() => <InstallerRoot />);
  
  // Verify initial resource allocation
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  
  unmount();
  
  // Force garbage collection if available
  if (global.gc) global.gc();
  
  // Verify memory is released
  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  expect(finalMemory).toBeLessThanOrEqual(initialMemory * 1.1); // Allow 10% variance
});
```

## Accessibility Testing

### A11y Requirements

Test compliance with accessibility standards:

```typescript
describe("Accessibility", () => {
  it("provides proper ARIA labels and roles", () => {
    render(() => <StepConfigEditingForm configuration={mockConfig} />);
    
    // Test form semantics
    expect(screen.getByRole("form")).toBeInTheDocument();
    
    // Test input labeling
    const appEUIInput = screen.getByLabelText(/AppEUI/);
    expect(appEUIInput).toHaveAttribute("aria-required", "true");
    
    // Test error announcement
    fireEvent.input(appEUIInput, { target: { value: "invalid" } });
    const errorElement = screen.getByRole("alert");
    expect(errorElement).toBeInTheDocument();
  });
  
  it("supports keyboard navigation", () => {
    render(() => <StepStartWaitingForUserForm />);
    
    const checkbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button");
    
    // Test tab order
    fireEvent.keyDown(checkbox, { key: "Tab" });
    expect(submitButton).toHaveFocus();
    
    // Test space activation
    fireEvent.keyDown(checkbox, { key: " " });
    expect(checkbox).toBeChecked();
  });
});
```

## Continuous Integration

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run", 
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### CI Configuration

Tests run automatically on:

- Pull request creation
- Push to main branch
- Manual workflow dispatch

### Coverage Reporting

- Coverage reports uploaded to Codecov
- PR comments with coverage changes
- HTML reports available as artifacts

## Best Practices

### Writing Tests

1. **Follow AAA pattern**: Arrange, Act, Assert
2. **Use descriptive test names**: What is being tested and expected outcome
3. **Test behavior, not implementation**: Focus on user-visible outcomes
4. **Keep tests independent**: Each test should run in isolation
5. **Use realistic test data**: Mirror production scenarios

### Test Maintenance

1. **Update tests with code changes**: Keep tests in sync with implementation
2. **Remove obsolete tests**: Clean up tests for removed features
3. **Refactor test utilities**: Extract common patterns into helpers
4. **Monitor test performance**: Keep test suite execution time reasonable

### Debugging Tests

1. **Use test UI**: Vitest UI for interactive debugging
2. **Enable verbose output**: Detailed error messages and stack traces
3. **Screenshot on failure**: Visual debugging for UI tests
4. **Log test state**: Console output for complex scenarios

## Tools and Commands

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test TextInput.test.tsx

# Run tests matching pattern
pnpm test --grep "validation"
```

### Coverage Analysis

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML coverage report
open coverage/index.html

# View coverage summary
pnpm test:coverage --reporter=text-summary
```

### Debugging

```bash
# Debug mode with inspector
pnpm test --inspect-brk

# Run single test in debug mode  
pnpm test --run --no-coverage TextInput.test.tsx
```