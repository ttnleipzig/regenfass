import { cn } from "@/libs/cn.ts";
import {
	formatAppKeyHexPairs,
	maskAppKeyFormattedForDisplay,
	normalizeAppKeyHexInput,
} from "@/libs/hexKeyDisplay.ts";
import { Eye, EyeOff } from "lucide-solid";
import type { Component } from "solid-js";
import { Show, createSignal } from "solid-js";

export interface AppKeyHexFieldProps {
	id: string;
	name: string;
	value: string;
	onCanonicalChange: (canonical: string) => void;
	class?: string;
}

/** Single-line AppKey editor: 32 hex digits stored; pairs spaced; bullet mask + reveal toggle. */
export const AppKeyHexField: Component<AppKeyHexFieldProps> = (props) => {
	const [revealed, setRevealed] = createSignal(false);

	const display = () => formatAppKeyHexPairs(props.value ?? "");
	const maskedPreview = () => maskAppKeyFormattedForDisplay(display());

	return (
		<div
			class={cn(
				"flex h-10 w-full overflow-hidden rounded-md border border-input bg-background text-sm shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				props.class,
			)}
		>
			<div class="relative min-h-10 min-w-0 flex-1">
				<Show when={!revealed()}>
					<span
						aria-hidden="true"
						class="pointer-events-none absolute inset-0 flex items-center whitespace-pre px-3 font-mono text-foreground"
					>
						{maskedPreview()}
					</span>
				</Show>
				<input
					id={props.id}
					name={props.name}
					type="text"
					autocomplete="off"
					spellCheck={false}
					maxLength={47}
					value={display()}
					class={cn(
						"relative z-10 h-10 w-full bg-transparent px-3 py-2 font-mono outline-none",
						revealed() ? "text-foreground" : "text-transparent caret-foreground",
					)}
					onInput={(e) => {
						const next = normalizeAppKeyHexInput(e.currentTarget.value);
						props.onCanonicalChange(next);
					}}
				/>
			</div>
			<button
				type="button"
				class="flex h-10 w-10 shrink-0 items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				aria-pressed={revealed()}
				aria-label={revealed() ? "Hide app key" : "Show app key"}
				onClick={() => setRevealed(!revealed())}
			>
				<Show when={revealed()} fallback={<Eye class="size-4" strokeWidth={1.75} />}>
					<EyeOff class="size-4" strokeWidth={1.75} />
				</Show>
			</button>
		</div>
	);
};
