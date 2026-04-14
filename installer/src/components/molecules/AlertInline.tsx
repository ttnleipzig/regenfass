import { cn } from "@/libs/cn.ts";
import type { AlertRootProps } from "@kobalte/core/alert";
import { Alert as AlertPrimitive } from "@kobalte/core/alert";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ParentProps, ValidComponent } from "solid-js";
import { Show, splitProps } from "solid-js";
import { AlertTriangle, CircleCheck, XCircle, Info } from "lucide-solid";

export const alertVariants = cva(
	"relative w-full rounded-lg border text-sm bg-card/60 dark:bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-5 py-4 ring-1 ring-border/50 dark:ring-border/80 [&:has(svg)]:pl-12 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-4 [&>svg]:text-foreground",
	{
		variants: {
			variant: {
				default: "text-foreground",
				destructive:
					"border-destructive/30 text-destructive bg-destructive/10 dark:border-destructive/55 dark:bg-destructive/[0.38] dark:text-destructive-foreground dark:ring-destructive/25 [&>svg]:text-destructive dark:[&>svg]:text-destructive-foreground",
				info:
					"border-info/30 text-info bg-info/10 dark:border-info/55 dark:bg-info/30 dark:text-info-foreground dark:ring-info/25 [&>svg]:text-info dark:[&>svg]:text-info",
				warning:
					"border-warning/30 text-warning bg-warning/10 dark:border-warning/55 dark:bg-warning/30 dark:text-warning-foreground dark:ring-warning/25 [&>svg]:text-warning dark:[&>svg]:text-warning",
				success:
					"border-success/30 text-success bg-success/10 dark:border-success/15 dark:bg-success/5 dark:text-foreground/75 dark:ring-border/35 [&>svg]:text-success dark:[&>svg]:text-success",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type alertProps<T extends ValidComponent = "div"> = ParentProps<AlertRootProps<T>> &
	VariantProps<typeof alertVariants> & {
		class?: string;
		showIcon?: boolean;
	};

export const AlertInline = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, alertProps<T>>,
) => {
	const [local, rest] = splitProps(props as Required<Pick<alertProps, "class" | "variant" | "showIcon">> & { children: any }, ["class", "variant", "showIcon", "children"]);

	const iconForVariant = () => {
		switch (local.variant) {
			case "destructive":
				return <XCircle size={16} />;
			case "warning":
				return <AlertTriangle size={16} />;
			case "info":
				return <Info size={16} />;
			case "success":
				return (
					<CircleCheck
						size={16}
						class={cn("text-success motion-safe:animate-success-check")}
						aria-hidden="true"
					/>
				);
			default:
				return null;
		}
	};

	return (
		<AlertPrimitive
			class={cn(
				alertVariants({
					variant: props.variant,
				}),
				local.class,
			)}
			{...rest}
		>
			<Show when={(local.showIcon ?? true) && iconForVariant()}>
				{iconForVariant()}
			</Show>
			<div>{local.children}</div>
		</AlertPrimitive>
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


