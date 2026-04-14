import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Web Serial (used by guards / integration tests; jsdom has no navigator.serial)
if (!("serial" in navigator)) {
	Object.defineProperty(navigator, "serial", {
		configurable: true,
		value: {
			requestPort: vi.fn(),
		},
	});
}
