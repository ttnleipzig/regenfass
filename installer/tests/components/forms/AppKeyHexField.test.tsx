import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { AppKeyHexField } from "@/components/forms/AppKeyHexField.tsx";
import { formatAppKeyHexPairs } from "@/libs/hexKeyDisplay.ts";

describe("AppKeyHexField", () => {
	const key32 = "0123456789ABCDEF0123456789ABCDEF";
	const onChange = vi.fn();

	afterEach(() => {
		cleanup();
		onChange.mockClear();
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

	it("toggles reveal label on the visibility button", () => {
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
		expect(screen.getByRole("button", { name: "Hide app key" })).toBeInTheDocument();
	});

	it("emits canonical hex without spaces on input", () => {
		render(() => (
			<AppKeyHexField id="ak" name="appKey" value="" onCanonicalChange={onChange} />
		));
		const input = document.getElementById("ak") as HTMLInputElement;
		fireEvent.input(input, { target: { value: "AB CD" } });
		expect(onChange).toHaveBeenCalledWith("ABCD");
	});
});
