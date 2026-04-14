import { Progress as ProgressPrimitive } from "@kobalte/core/progress";
import { cn } from "@/libs/cn.ts";
import type { ProgressRootProps } from "@kobalte/core/progress";
import type { ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

export type ProgressProps<T extends ValidComponent = "div"> = PolymorphicProps<
	T,
	ProgressRootProps<T>
> & {
	class?: string;
};

/**
 * Determinate progress bar (Kobalte Progress, shadcn-solid-style).
 * `value` is 0–100 when `indeterminate` is false.
 */
export function Progress<T extends ValidComponent = "div">(
	props: ProgressProps<T>,
) {
	const [local, others] = splitProps(props as ProgressProps, ["class"]);

	return (
		<ProgressPrimitive
			class={cn("flex w-full flex-col gap-2", local.class)}
			{...others}
		>
			<ProgressPrimitive.Track
				class={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20")}
			>
				<ProgressPrimitive.Fill
					class={cn(
						"h-full w-[var(--kb-progress-fill-width)] bg-primary transition-[width] duration-300 ease-in-out",
					)}
				/>
			</ProgressPrimitive.Track>
		</ProgressPrimitive>
	);
}
