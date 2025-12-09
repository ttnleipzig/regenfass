import { cn } from "@/libs/cn.ts";
import type { ButtonRootProps } from "@kobalte/core/button";
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

export const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/80 data-[pressed]:bg-primary/80",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 data-[pressed]:bg-destructive/80",
				outline:
					"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/90 data-[pressed]:bg-accent/90",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 data-[pressed]:bg-secondary/70",
				ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 data-[pressed]:bg-accent/80",
				link: "text-primary underline-offset-4 hover:underline active:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type buttonProps<T extends ValidComponent = "button"> = ButtonRootProps<T> &
	VariantProps<typeof buttonVariants> & {
		class?: string;
	};

export const Button = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, buttonProps<T>>,
) => {
	const [local, rest] = splitProps(props as buttonProps, [
		"class",
		"variant",
		"size",
	]);

	return (
		<ButtonPrimitive
			class={cn(
				buttonVariants({
					size: local.size,
					variant: local.variant,
				}),
				local.class,
			)}
			{...rest}
		/>
	);
};
