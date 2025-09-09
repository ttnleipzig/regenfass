import { cn } from "@/libs/cn";
import type { AlertRootProps } from "@kobalte/core/alert";
import { Alert as AlertPrimitive } from "@kobalte/core/alert";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

export const alertVariants = cva(
	"relative w-full rounded-lg border text-sm bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-5 py-4 ring-1 ring-border/50 [&:has(svg)]:pl-12 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-4 [&>svg]:text-foreground",
	{
		variants: {
			variant: {
				default: "text-foreground",
				destructive:
					"border-destructive/30 text-destructive bg-destructive/10 dark:border-destructive/40 [&>svg]:text-destructive",
				info: "border-info/30 text-info bg-info/10 dark:border-info/40 [&>svg]:text-info",
				warning:
					"border-warning/30 text-warning bg-warning/10 dark:border-warning/40 [&>svg]:text-warning",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type alertProps<T extends ValidComponent = "div"> = AlertRootProps<T> &
	VariantProps<typeof alertVariants> & {
		class?: string;
	};

export const Alert = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, alertProps<T>>,
) => {
	const [local, rest] = splitProps(props as alertProps, ["class", "variant"]);

	return (
		<AlertPrimitive
			class={cn(
				alertVariants({
					variant: props.variant,
				}),
				local.class,
			)}
			{...rest}
		/>
	);
};

export const AlertTitle = (props: ComponentProps<"div">) => {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<div class={cn("font-medium leading-5 tracking-tight", local.class)} {...rest} />
	);
};

export const AlertDescription = (props: ComponentProps<"div">) => {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<div class={cn("text-sm [&_p]:leading-relaxed", local.class)} {...rest} />
	);
};


