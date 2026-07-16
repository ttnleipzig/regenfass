import { createEffect } from "solid-js";
import { Button } from "./Button.tsx";
import Moon from "lucide-solid/icons/moon";
import Sun from "lucide-solid/icons/sun";
import { useColorMode } from "@kobalte/core/color-mode";
import { trackEvent } from "../../libs/analytics.ts";
import { applyColorMode, persistColorMode } from "../../libs/colorMode.ts";
import { useBrandT } from "../../i18n/LocaleProvider.tsx";

export function ButtonModeToggle() {
	const { colorMode, setColorMode } = useColorMode();
	const t = useBrandT();

	// Keep Tailwind `.dark` aligned with Kobalte after hydrate / system changes.
	createEffect(() => {
		applyColorMode(colorMode() === "dark" ? "dark" : "light");
	});

	const toggle = () => {
		const next = colorMode() === "light" ? "dark" : "light";
		setColorMode(next);
		applyColorMode(next);
		persistColorMode(next);
		trackEvent("theme_toggled", { theme: next });
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={t("a11y.toggleColorMode")}
			onClick={toggle}
			class="transition-transform duration-200 active:scale-95 text-foreground/80 hover:text-foreground"
		>
			<div class="relative h-4 w-4">
				<Sun
					size={16}
					class={
						(colorMode() === "dark"
							? "opacity-100 rotate-0 scale-100"
							: "opacity-0 -rotate-90 scale-0") +
						" absolute inset-0 m-auto transition-all duration-300"
					}
				/>
				<Moon
					size={16}
					class={
						(colorMode() === "light"
							? "opacity-100 rotate-0 scale-100"
							: "opacity-0 rotate-90 scale-0") +
						" absolute inset-0 m-auto transition-all duration-300"
					}
				/>
			</div>
		</Button>
	);
}
