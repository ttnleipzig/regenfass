import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@solidjs/testing-library";
import { AppKeyHexField } from "@regenfass/brand";
import { formatAppKeyHexPairs } from "@/libs/hexKeyDisplay.ts";

const warmUpSlotAudio = vi.fn();
const playSlotRevealFinishSound = vi.fn();

vi.mock("../../../../brand/src/libs/slotRevealSound.ts", () => ({
	warmUpSlotAudio: (...args: unknown[]) => warmUpSlotAudio(...args),
	playSlotRevealFinishSound: (...args: unknown[]) => playSlotRevealFinishSound(...args),
}));

describe("AppKeyHexField", () => {
	const key32 = "0123456789ABCDEF0123456789ABCDEF";
	const onChange = vi.fn();

	afterEach(() => {
		cleanup();
		onChange.mockClear();
		warmUpSlotAudio.mockClear();
		playSlotRevealFinishSound.mockClear();
	});

	it("shows formatted value in the input and a show/hide control", () => {
		render(() => (
			<>
				<label for="ak">appKey</label>
				<AppKeyHexField
					id="ak"
					name="appKey"
					value={key32}
					onCanonicalChange={onChange}
				/>
			</>
		));
		const input = screen.getByLabelText("appKey") as HTMLInputElement;
		expect(input.value).toBe(formatAppKeyHexPairs(key32));
		expect(screen.getByRole("button", { name: "Show app key" })).toBeInTheDocument();
	});

	it("toggles reveal label on the visibility button after slot animation", async () => {
		render(() => (
			<>
				<label for="ak">appKey</label>
				<AppKeyHexField
					id="ak"
					name="appKey"
					value={key32}
					onCanonicalChange={onChange}
				/>
			</>
		));
		const btn = screen.getByRole("button", { name: "Show app key" });
		fireEvent.click(btn);
		expect(warmUpSlotAudio).toHaveBeenCalledTimes(1);
		await waitFor(
			() => {
				expect(screen.getByRole("button", { name: "Hide app key" })).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
		expect(playSlotRevealFinishSound).toHaveBeenCalledTimes(1);
	});

	it("reveals immediately when value is empty", async () => {
		render(() => (
			<>
				<label for="ak">appKey</label>
				<AppKeyHexField id="ak" name="appKey" value="" onCanonicalChange={onChange} />
			</>
		));
		fireEvent.click(screen.getByRole("button", { name: "Show app key" }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Hide app key" })).toBeInTheDocument();
		});
	});

	it("emits canonical hex without spaces on input", () => {
		render(() => (
			<AppKeyHexField id="ak" name="appKey" value="" onCanonicalChange={onChange} />
		));
		const input = document.getElementById("ak") as HTMLInputElement;
		fireEvent.input(input, { target: { value: "AB CD" } });
		expect(onChange).toHaveBeenCalledWith("ABCD");
	});

	it("renders copy button when showCopyButton is set", () => {
		render(() => (
			<>
				<label for="ak">appKey</label>
				<AppKeyHexField
					id="ak"
					name="appKey"
					value={key32}
					showCopyButton
					onCanonicalChange={onChange}
				/>
			</>
		));
		expect(
			screen.getByRole("button", { name: /copy appKey to clipboard/i }),
		).toBeInTheDocument();
	});

	it("copies appKey as uppercase hex", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });

		render(() => (
			<AppKeyHexField
				id="ak"
				name="appKey"
				value={key32}
				showCopyButton
				onCanonicalChange={onChange}
			/>
		));
		fireEvent.click(
			screen.getByRole("button", { name: /copy appKey to clipboard/i }),
		);

		expect(writeText).toHaveBeenCalledWith(key32);
	});

	it("disables copy button when value is empty", () => {
		render(() => (
			<AppKeyHexField
				id="ak"
				name="appKey"
				value=""
				showCopyButton
				onCanonicalChange={onChange}
			/>
		));
		expect(
			screen.getByRole("button", { name: /copy appKey to clipboard/i }),
		).toBeDisabled();
	});

	it("renders reset button when showResetButton is set and value is non-empty", () => {
		render(() => (
			<AppKeyHexField
				id="ak"
				name="appKey"
				value={key32}
				showResetButton
				onCanonicalChange={onChange}
			/>
		));
		expect(
			screen.getByRole("button", { name: "Clear appKey" }),
		).toBeInTheDocument();
	});

	it("hides reset button when value is empty", () => {
		render(() => (
			<AppKeyHexField
				id="ak"
				name="appKey"
				value=""
				showResetButton
				onCanonicalChange={onChange}
			/>
		));
		expect(
			screen.queryByRole("button", { name: "Clear appKey" }),
		).not.toBeInTheDocument();
	});

	it("clears value when reset button is clicked", () => {
		render(() => (
			<AppKeyHexField
				id="ak"
				name="appKey"
				value={key32}
				showResetButton
				onCanonicalChange={onChange}
			/>
		));
		fireEvent.click(screen.getByRole("button", { name: "Clear appKey" }));
		expect(onChange).toHaveBeenCalledWith("");
	});

	it("resets reveal state when reset button is clicked after reveal", async () => {
		render(() => (
			<>
				<label for="ak">appKey</label>
				<AppKeyHexField
					id="ak"
					name="appKey"
					value={key32}
					showResetButton
					onCanonicalChange={onChange}
				/>
			</>
		));
		fireEvent.click(screen.getByRole("button", { name: "Show app key" }));
		await waitFor(
			() => {
				expect(screen.getByRole("button", { name: "Hide app key" })).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
		fireEvent.click(screen.getByRole("button", { name: "Clear appKey" }));
		expect(onChange).toHaveBeenCalledWith("");
		expect(screen.getByRole("button", { name: "Show app key" })).toBeInTheDocument();
	});
});
