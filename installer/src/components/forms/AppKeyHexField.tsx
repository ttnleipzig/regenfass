import { cn } from "@/libs/cn.ts";
import {
	buildSlotReelRows,
	formatAppKeyHexPairs,
	maskHexPairForDisplay,
	normalizeAppKeyHexInput,
	splitCanonicalHexPairs,
} from "@/libs/hexKeyDisplay.ts";
import {
	playSlotRevealFinishSound,
	warmUpSlotAudio,
} from "@/libs/slotRevealSound.ts";
import { copyTextToClipboard } from "@/libs/copyToClipboard.ts";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import { BiRegularClipboard } from "solid-icons/bi";
import type { Component } from "solid-js";
import { For, Show, createSignal, onCleanup, onMount } from "solid-js";

export interface AppKeyHexFieldProps {
	id: string;
	name: string;
	value: string;
	onCanonicalChange: (canonical: string) => void;
	class?: string;
	showCopyButton?: boolean;
}

/** Row height must match `h-10` (40px) for translate distance. */
const REEL_ROW_PX = 40;

/** Pixels past the target row (more negative `translateY`) before springing back. */
const REEL_OVERSHOOT_PX = 6;

/** Timeline position (0–1) where the reel hits the overshoot; rest is settle-back. */
const REEL_OVERSHOOT_AT = 0.89;

/** Main spin: high initial speed, then strong deceleration (spinning wheel). */
const REEL_SPIN_EASING = "cubic-bezier(0.04, 0.72, 0.12, 1)";

/** Short correction from overshoot to exact row. */
const REEL_SETTLE_EASING = "cubic-bezier(0.33, 0, 0.25, 1)";

const REEL_BASE_DURATION_MS = 720;
const REEL_STAGGER_MS = 95;
/** Start finish bings before the last reel lands. */
const REVEAL_SOUND_EARLY_MS = 400;

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
			const pastY = endY - REEL_OVERSHOOT_PX;
			const duration = REEL_BASE_DURATION_MS + props.reelIndex * REEL_STAGGER_MS;
			anim = el.animate(
				[
					{
						transform: "translateY(0px)",
						offset: 0,
						easing: REEL_SPIN_EASING,
					},
					{
						transform: `translateY(${pastY}px)`,
						offset: REEL_OVERSHOOT_AT,
						easing: REEL_SETTLE_EASING,
					},
					{ transform: `translateY(${endY}px)`, offset: 1 },
				],
				{ duration, fill: "forwards" },
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

/** Width of 16 hex pair columns (`w-9` each), aligned with AppEUI/DevEUI slot rows. */
const APP_KEY_HEX_COLUMNS_CLASS = "w-[36rem]";

/** Single-line AppKey editor: bullet mask + vertical reel columns (wheel spin + overshoot) on reveal + chime. */
export const AppKeyHexField: Component<AppKeyHexFieldProps> = (props) => {
	const [revealed, setRevealed] = createSignal(false);
	const [spinning, setSpinning] = createSignal(false);
	const [reelMatrix, setReelMatrix] = createSignal<string[][] | null>(null);
	const [copied, setCopied] = createSignal(false);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;
	let finishSoundTimeout: ReturnType<typeof setTimeout> | undefined;
	let finishSoundPlayed = false;

	let finishedCount = 0;
	let expectedReels = 0;

	const resetSpinState = () => {
		clearTimeout(finishSoundTimeout);
		finishSoundTimeout = undefined;
		finishSoundPlayed = false;
		setSpinning(false);
		setReelMatrix(null);
		finishedCount = 0;
		expectedReels = 0;
	};

	onCleanup(() => {
		resetSpinState();
		clearTimeout(copiedTimeout);
	});

	const display = () => formatAppKeyHexPairs(props.value ?? "");
	const canonicalPairs = () => splitCanonicalHexPairs(props.value ?? "");
	const spinInProgress = () => spinning();
	// Full-area invisible text + column overlay when pairs exist (masked or revealed) and not spinning.
	const columnLayoutActive = () =>
		!spinInProgress() && (revealed() || canonicalPairs().length > 0);

	const playFinishSoundOnce = () => {
		if (finishSoundPlayed) return;
		finishSoundPlayed = true;
		playSlotRevealFinishSound();
	};

	const onReelFinished = () => {
		finishedCount += 1;
		if (finishedCount >= expectedReels) {
			clearTimeout(finishSoundTimeout);
			finishSoundTimeout = undefined;
			playFinishSoundOnce();
			resetSpinState();
			setRevealed(true);
		}
	};

	const scheduleFinishSound = (reelCount: number) => {
		const lastReelMs = REEL_BASE_DURATION_MS + (reelCount - 1) * REEL_STAGGER_MS;
		const soundDelayMs = Math.max(0, lastReelMs - REVEAL_SOUND_EARLY_MS);
		finishSoundTimeout = setTimeout(() => {
			finishSoundTimeout = undefined;
			playFinishSoundOnce();
		}, soundDelayMs);
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
		scheduleFinishSound(pairs.length);
	};

	const handleToggleReveal = () => {
		if (revealed()) {
			resetSpinState();
			setRevealed(false);
			return;
		}
		if (spinInProgress()) return;
		warmUpSlotAudio();
		startRevealSpin();
	};

	const copyLabel = () =>
		copied() ? "Copied appKey" : "Copy appKey to clipboard";

	const copyToClipboard = async () => {
		const canonical = props.value ?? "";
		if (!canonical) return;
		const ok = await copyTextToClipboard(canonical.toUpperCase());
		if (!ok) {
			console.error("Failed to copy appKey");
			return;
		}
		setCopied(true);
		clearTimeout(copiedTimeout);
		copiedTimeout = setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			class={cn(
				"flex h-10 w-fit max-w-full overflow-hidden rounded-md border border-input bg-background text-sm shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				props.class,
			)}
		>
			<div class={cn("relative min-h-10 shrink-0", APP_KEY_HEX_COLUMNS_CLASS)}>
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
					spellcheck={false}
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
			<Show when={props.showCopyButton}>
				<button
					type="button"
					disabled={spinInProgress() || !(props.value ?? "")}
					class="flex h-10 w-10 shrink-0 items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
					aria-label={copyLabel()}
					onClick={copyToClipboard}
				>
					<BiRegularClipboard aria-hidden={true} size={16} />
				</button>
			</Show>
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
