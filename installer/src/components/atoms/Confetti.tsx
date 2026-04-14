import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { cn } from "@/libs/cn.ts";
import "./Confetti.css";

/** Number of confetti pieces in one burst (exported for tests). */
export const CONFETTI_PARTICLE_COUNT = 48;

const CONFETTI_COLORS = [
	"bg-destructive",
	"bg-primary",
	"bg-green-500",
	"bg-yellow-500",
	"bg-purple-500",
	"bg-blue-500",
	"bg-pink-500",
	"bg-orange-500",
] as const;

function particleVars(index: number): Record<string, string> {
	/* Deterministic spread so tests and SSR stay stable */
	const angle = ((index * 137.5080469) % 360) + (index % 7) * 4.2;
	const travel = `${42 + (index % 14) * 4}vmin`;
	const delay = `${(index % 6) * 22}ms`;
	const dur = `${1480 + (index % 5) * 110}ms`;
	const spinMid = `${280 + (index % 6) * 55}deg`;
	const spinEnd = `${520 + (index % 8) * 95}deg`;
	const fall = `${68 + (index % 11) * 7}vh`;
	return {
		"--confetti-angle": `${angle}deg`,
		"--confetti-travel": travel,
		"--confetti-delay": delay,
		"--confetti-dur": dur,
		"--confetti-spin-mid": spinMid,
		"--confetti-spin-end": spinEnd,
		"--confetti-fall": fall,
	};
}

interface ConfettiProps {
	/** When true, shows a one-shot fullscreen burst from the center of the viewport */
	active?: boolean;
}

/**
 * Full-viewport confetti: radial burst from the center, then pieces fall with gravity.
 */
const Confetti: Component<ConfettiProps> = (props) => {
	return (
		<Show when={props.active}>
			<div
				class="confetti-burst pointer-events-none fixed inset-0 z-[100] overflow-hidden"
				aria-hidden="true"
				role="presentation"
			>
				<For each={Array.from({ length: CONFETTI_PARTICLE_COUNT }, (_, i) => i)}>
					{(i) => (
						<div class="confetti-burst__carrier" style={particleVars(i)}>
							<div class="confetti-burst__radial">
								<div
									class={cn(
										"confetti-burst__shard",
										CONFETTI_COLORS[i % CONFETTI_COLORS.length],
									)}
								/>
							</div>
						</div>
					)}
				</For>
			</div>
		</Show>
	);
};

export default Confetti;
