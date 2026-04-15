import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// @corvu/otp-field uses ResizeObserver via @corvu/utils (jsdom does not provide it)
if (typeof globalThis.ResizeObserver === "undefined") {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

// Web Animations API (slot reels in AppKeyHexField; jsdom has no Element.animate)
if (typeof HTMLElement !== "undefined" && !HTMLElement.prototype.animate) {
	HTMLElement.prototype.animate = function () {
		let cancelled = false;
		return {
			cancel: () => {
				cancelled = true;
			},
			finished: new Promise<void>((resolve, reject) => {
				queueMicrotask(() => {
					if (cancelled) {
						reject(new DOMException("Animation cancelled", "AbortError"));
						return;
					}
					resolve();
				});
			}),
		} as unknown as Animation;
	};
}

// Web Serial (used by guards / integration tests; jsdom has no navigator.serial)
if (!("serial" in navigator)) {
	Object.defineProperty(navigator, "serial", {
		configurable: true,
		value: {
			requestPort: vi.fn(),
		},
	});
}
