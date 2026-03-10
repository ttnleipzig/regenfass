import { beforeEach, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@solidjs/testing-library";

// Extend Vitest's expect with jest-dom matchers
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void>,
        TestingLibraryMatchers<T, void> {}
  }
}

// Mock Web Serial API for tests
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

// Cleanup after each test
beforeEach(() => {
  cleanup();
});