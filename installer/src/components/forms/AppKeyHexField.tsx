import { cn } from "@/libs/cn.ts";
import {
	buildSlotReelRows,
	formatAppKeyHexPairs,
	maskHexPairForDisplay,
	normalizeAppKeyHexInput,
	splitCanonicalHexPairs,
} from "@/libs/hexKeyDisplay.ts";
import { playSlotRevealSound } from "@/libs/slotRevealSound.ts";
import { Eye, EyeOff } from "lucide-solid";
import type { Component } from "solid-js";
import { For, Show, createSignal, onCleanup, onMount } from "solid-js";

export interface AppKeyHexFieldProps {
	id: string;
	name: string;
	value: string;
	onCanonicalChange: (canonical: string) => void;
	class?: string;
}

/** Row height must match `h-10` (40px) for translate distance. */
const REEL_ROW_PX = 40;

/** Strong ease-out: fast spin, long slow settle (slot machine). */
const REEL_EASING = "cubic-bezier(0.03, 0.82, 0.08, 1)";

const SlotPairReel: Component<{
	rows: string[];
	reelIndex: number;
	onFinished: () => void;
}> = (props) => {
	let innerEl: HTMLDivElement | undefined;
	let anim: Animation | undefined;

	onMount(() => {
		queueMicrotask(() => {
			const el = innerEl;
			if (!el) return;
			const rowCount = props.rows.length;
			const endY = -(rowCount - 1) * REEL_ROW_PX;
			const duration = 720 + props.reelIndex * 95;
			anim = el.animate(
				[
					{ transform: "translateY(0px)" },
					{ transform: `translateY(${endY}px)` },
				],
				{ duration, easing: REEL_EASING, fill: "forwards" },
			);
			void anim.finished.then(() => props.onFinished()).catch(() => {});
		});
	});

	onCleanup(() => {
		anim?.cancel();
	});

	return (
		<div class="flex h-10 w-9 shrink-0 flex-col overflow-hidden border-r border-input bg-background last:border-r-0">
			<div ref={(el) => (innerEl = el)} class="flex flex-col">
				<For each={props.rows}>
					{(row) => (
						<div class="flex h-10 shrink-0 items-center justify-center font-mono text-sm font-semibold tabular-nums leading-none text-foreground">
							{row}
						</div>
					)}
				</For>
			</div>
		</div>
	);
};

/** Single-line AppKey editor: bullet mask + vertical slot reels on reveal + chime. */
export const AppKeyHexField: Component<AppKeyHexFieldProps> = (props) => {
	const [revealed, setRevealed] = createSignal(false);
	const [spinning, setSpinning] = createSignal(false);
	const [reelMatrix, setReelMatrix] = createSignal<string[][] | null>(null);

	let finishedCount = 0;
	let expectedReels = 0;

	const resetSpinState = () => {
		setSpinning(false);
		setReelMatrix(null);
		finishedCount = 0;
		expectedReels = 0;
	};

	onCleanup(() => {
		resetSpinState();
	});

	const display = () => formatAppKeyHexPairs(props.value ?? "");
	const canonicalPairs = () => splitCanonicalHexPairs(props.value ?? "");
	const spinInProgress = () => spinning();
	// Full-area invisible text + column overlay when pairs exist (masked or revealed) and not spinning.
	const columnLayoutActive = () =>
		!spinInProgress() && (revealed() || canonicalPairs().length > 0);

	const onReelFinished = () => {
		finishedCount += 1;
		if (finishedCount >= expectedReels) {
			playSlotRevealSound();
			resetSpinState();
			setRevealed(true);
		}
	};

	const startRevealSpin = () => {
		const canonical = props.value ?? "";
		const pairs = splitCanonicalHexPairs(canonical);
		if (pairs.length === 0) {
			setRevealed(true);
			return;
		}
		finishedCount = 0;
		expectedReels = pairs.length;
		const matrix = pairs.map((pair, i) => buildSlotReelRows(pair, i));
		setReelMatrix(matrix);
		setSpinning(true);
	};

	const handleToggleReveal = () => {
		if (revealed()) {
			resetSpinState();
			setRevealed(false);
			return;
		}
		if (spinInProgress()) return;
		startRevealSpin();
	};

	return (
		<div
			class={cn(
				"flex h-10 w-full overflow-hidden rounded-md border border-input bg-background text-sm shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				props.class,
			)}
		>
			<div class="relative min-h-10 min-w-0 flex-1">
				<Show when={!revealed() && !spinInProgress() && canonicalPairs().length > 0}>
					<div
						aria-hidden="true"
						class="pointer-events-none absolute inset-0 z-[5] flex h-10 items-stretch overflow-x-auto bg-background [&>*:first-child]:border-l [&>*:first-child]:border-input"
					>
						<For each={canonicalPairs()}>
							{(pair) => (
								<div class="flex h-10 w-9 shrink-0 items-center justify-center border-r border-input bg-background font-mono text-sm font-semibold tabular-nums text-foreground last:border-r-0">
									{maskHexPairForDisplay(pair)}
								</div>
							)}
						</For>
					</div>
				</Show>
				<Show when={spinInProgress() && reelMatrix()}>
					<div
						aria-hidden="true"
						class="absolute inset-0 z-20 flex h-10 items-stretch overflow-x-auto bg-background [&>*:first-child]:border-l [&>*:first-child]:border-input"
					>
						<For each={reelMatrix()!}>
							{(rows, i) => (
								<SlotPairReel rows={rows} reelIndex={i()} onFinished={onReelFinished} />
							)}
						</For>
					</div>
				</Show>
				<Show when={revealed() && !spinInProgress() && canonicalPairs().length > 0}>
					<div
						aria-hidden="true"
						class="pointer-events-none absolute inset-0 z-[5] flex h-10 items-stretch overflow-x-auto bg-background [&>*:first-child]:border-l [&>*:first-child]:border-input"
					>
						<For each={canonicalPairs()}>
							{(pair) => (
								<div class="flex h-10 w-9 shrink-0 items-center justify-center border-r border-input bg-background font-mono text-sm font-semibold tabular-nums text-foreground last:border-r-0">
									{pair}
								</div>
							)}
						</For>
					</div>
				</Show>
				<input
					id={props.id}
					name={props.name}
					type="text"
					autocomplete="off"
					spellCheck={false}
					maxLength={47}
					value={display()}
					disabled={spinInProgress()}
					class={cn(
						"z-10 font-mono outline-none disabled:cursor-not-allowed",
						columnLayoutActive()
							? "absolute inset-0 h-10 w-full cursor-text border-0 bg-transparent px-0 text-transparent caret-foreground"
							: "relative h-10 w-full bg-transparent px-3 py-2 text-transparent caret-foreground",
					)}
					onInput={(e) => {
						const next = normalizeAppKeyHexInput(e.currentTarget.value);
						props.onCanonicalChange(next);
					}}
				/>
			</div>
			<button
				type="button"
				disabled={spinInProgress()}
				class="flex h-10 w-10 shrink-0 items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
				aria-pressed={revealed()}
				aria-busy={spinInProgress()}
				aria-label={revealed() ? "Hide app key" : "Show app key"}
				onClick={handleToggleReveal}
			>
				<Show when={revealed()} fallback={<Eye class="size-4" strokeWidth={1.75} />}>
					<EyeOff class="size-4" strokeWidth={1.75} />
				</Show>
			</button>
		</div>
	);
};
