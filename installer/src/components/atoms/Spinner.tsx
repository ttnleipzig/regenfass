import { cn } from "@/libs/cn.ts";
import { LoaderCircle } from "lucide-solid";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

export interface SpinnerProps extends ComponentProps<"svg"> {
	size?: "sm" | "md" | "lg";
}

export const Spinner = (props: SpinnerProps) => {
	const [local, rest] = splitProps(props, ["class", "size"]);

	const sizeClasses = {
		sm: "size-3",
		md: "size-4",
		lg: "size-6",
	};

	return (
		<LoaderCircle
			role="status"
			aria-label="Loading"
			class={cn("animate-spin", sizeClasses[local.size ?? "md"], local.class)}
			{...rest}
		/>
	);
};
