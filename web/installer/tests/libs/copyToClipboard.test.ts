import { afterEach, describe, expect, it, vi } from "vitest";
import { copyTextToClipboard } from "@/libs/copyToClipboard.ts";

const playCameraCopySound = vi.fn();

vi.mock("../../../brand/src/libs/cameraCopySound.ts", () => ({
	playCameraCopySound: (...args: unknown[]) => playCameraCopySound(...args),
}));

describe("copyToClipboard", () => {
	afterEach(() => {
		playCameraCopySound.mockClear();
		vi.unstubAllGlobals();
	});

	it("copies text and plays camera sound on success", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });

		const ok = await copyTextToClipboard("ABCD");

		expect(ok).toBe(true);
		expect(writeText).toHaveBeenCalledWith("ABCD");
		expect(playCameraCopySound).toHaveBeenCalledTimes(1);
	});

	it("returns false and skips sound when clipboard fails", async () => {
		const writeText = vi.fn().mockRejectedValue(new Error("denied"));
		Object.assign(navigator, { clipboard: { writeText } });

		const ok = await copyTextToClipboard("ABCD");

		expect(ok).toBe(false);
		expect(playCameraCopySound).not.toHaveBeenCalled();
	});
});
