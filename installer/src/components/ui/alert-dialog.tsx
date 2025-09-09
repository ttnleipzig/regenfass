import { cn } from "@/libs/cn";
import type {
	AlertDialogCloseButtonProps,
	AlertDialogContentProps,
	AlertDialogDescriptionProps,
	AlertDialogTitleProps,
} from "@kobalte/core/alert-dialog";
import { AlertDialog as AlertDialogPrimitive } from "@kobalte/core/alert-dialog";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { ComponentProps, ParentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { buttonVariants } from "./button";

export const AlertDialog = AlertDialogPrimitive;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

type alertDialogContentProps<T extends ValidComponent = "div"> = ParentProps<
	AlertDialogContentProps<T> & {
		class?: string;
	}
>;

export const AlertDialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, alertDialogContentProps<T>>,
) => {
	const [local, rest] = splitProps(props as alertDialogContentProps, [
		"class",
		"children",
	]);

	return (
		<AlertDialogPrimitive.Portal>
			<AlertDialogPrimitive.Overlay class={cn("fixed inset-0 z-50 bg-background/80 data-[expanded]:(animate-in fade-in-0) data-[closed]:(animate-out fade-out-0)")} />
			<AlertDialogPrimitive.Content
				class={cn(
					"fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[expanded]:(animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-48%) data-[closed]:(animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-48%) sm:rounded-lg md:w-full",
					local.class,
				)}
				{...rest}
			>
				{local.children}
			</AlertDialogPrimitive.Content>
		</AlertDialogPrimitive.Portal>
	);
};

export const AlertDialogHeader = (props: ComponentProps<"div">) => {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<div
			class={cn("flex flex-col space-y-2 text-center sm:text-left", local.class)}
			{...rest}
		/>
	);
};

export const AlertDialogFooter = (props: ComponentProps<"div">) => {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<div
			class={cn("flex flex-col-reverse sm:(flex-row justify-end space-x-2)", local.class)}
			{...rest}
		/>
	);
};

type alertDialogTitleProps<T extends ValidComponent = "h2"> =
	AlertDialogTitleProps<T> & {
		class?: string;
	};

export const AlertDialogTitle = <T extends ValidComponent = "h2">(
	props: PolymorphicProps<T, alertDialogTitleProps<T>>,
) => {
	const [local, rest] = splitProps(props as alertDialogTitleProps, ["class"]);

	return (
		<AlertDialogPrimitive.Title class={cn("text-lg font-semibold", local.class)} {...rest} />
	);
};

type alertDialogDescriptionProps<T extends ValidComponent = "p"> =
	AlertDialogDescriptionProps<T> & {
		class?: string;
	};

export const AlertDialogDescription = <T extends ValidComponent = "p">(
	props: PolymorphicProps<T, alertDialogDescriptionProps<T>>,
) => {
	const [local, rest] = splitProps(props as alertDialogDescriptionProps, [
		"class",
	]);

	return (
		<AlertDialogPrimitive.Description class={cn("text-sm text-muted-foreground", local.class)} {...rest} />
	);
};

type alertDialogCloseProps<T extends ValidComponent = "button"> =
	AlertDialogCloseButtonProps<T> & {
		class?: string;
	};

export const AlertDialogClose = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, alertDialogCloseProps<T>>,
) => {
	const [local, rest] = splitProps(props as alertDialogCloseProps, ["class"]);

	return (
		<AlertDialogPrimitive.CloseButton
			class={cn(
				buttonVariants({ variant: "outline" }),
				"mt-2 md:mt-0",
				local.class,
			)}
			{...rest}
		/>
	);
};

export const AlertDialogAction = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, alertDialogCloseProps<T>>,
) => {
	const [local, rest] = splitProps(props as alertDialogCloseProps, ["class"]);

	return (
		<AlertDialogPrimitive.CloseButton class={cn(buttonVariants(), local.class)} {...rest} />
	);
};


