import { cn } from "@/libs/cn.ts";
import { For } from "solid-js";
import { splitProps } from "solid-js";

export type StepPaginatorVariant = "default" | "compact";

export type StepPaginatorProps = {
	/** Step labels in order (shown as 1, 2, …). */
	steps: readonly string[];
	/** Optional heading above the list. */
	title?: string;
	variant?: StepPaginatorVariant;
	/** Accessible name for the step list. */
	listAriaLabel?: string;
	class?: string;
	/** 1-based index of the active step; omit for a static, equal-weight list. */
	activeStep?: number;
};

export function StepPaginator(props: StepPaginatorProps) {
	const [local] = splitProps(props, [
		"steps",
		"title",
		"variant",
		"listAriaLabel",
		"class",
		"activeStep",
	]);

	const layout = () => local.variant ?? "default";
	const ariaLabel = () => local.listAriaLabel ?? "Steps";

	const badgeClasses = (stepNumber: number) => {
		const active = local.activeStep;
		const isDefault = layout() === "default";
		const size = isDefault
			? "size-10 text-sm"
			: "size-8 text-xs";

		if (active === undefined) {
			return cn(
				"flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold tabular-nums text-primary",
				size,
			);
		}
		if (stepNumber === active) {
			return cn(
				"flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold tabular-nums text-primary-foreground shadow-sm",
				size,
			);
		}
		if (stepNumber < active) {
			return cn(
				"flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold tabular-nums text-muted-foreground",
				size,
			);
		}
		return cn(
			"flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold tabular-nums text-primary/70",
			size,
		);
	};

	const labelClasses = (stepNumber: number) => {
		const active = local.activeStep;
		const isCompact = layout() === "compact";
		const base = isCompact
			? "text-sm leading-snug"
			: "text-base leading-relaxed";

		if (active === undefined) {
			return cn("text-foreground", isCompact ? "pt-0.5" : "pt-1.5", base);
		}
		if (stepNumber === active) {
			return cn("font-medium text-foreground", isCompact ? "pt-0.5" : "pt-1.5", base);
		}
		return cn("text-muted-foreground", isCompact ? "pt-0.5" : "pt-1.5", base);
	};

	return (
		<div
			class={cn(
				"rounded-lg border border-border bg-card/60 p-5 shadow-sm ring-1 ring-border/40 backdrop-blur supports-[backdrop-filter]:bg-card/50 sm:p-6 dark:bg-card/70 dark:ring-border/50",
				local.class,
			)}
		>
			{local.title !== undefined && local.title !== "" ? (
				<p class="mb-4 text-sm font-medium text-foreground">{local.title}</p>
			) : null}
			<ol
				class={cn(
					"flex list-none",
					layout() === "default"
						? "flex-col gap-5"
						: "flex-row flex-wrap items-start gap-x-4 gap-y-3",
				)}
				aria-label={ariaLabel()}
			>
				<For each={[...local.steps]}>
					{(label, index) => {
						const stepNumber = index() + 1;
						return (
							<li
								class={cn(
									"flex gap-4",
									layout() === "compact" &&
										"max-w-[min(100%,20rem)] gap-2 sm:max-w-none",
								)}
							>
								<span class={badgeClasses(stepNumber)} aria-hidden="true">
									{stepNumber}
								</span>
								<span class={labelClasses(stepNumber)}>{label}</span>
							</li>
						);
					}}
				</For>
			</ol>
		</div>
	);
}
