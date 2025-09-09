import { Button } from "@/components/ui/button";
import { IconMoon, IconSun } from "@tabler/icons-solidjs";
import { useColorMode } from "@kobalte/core/color-mode";

export function ModeToggle() {
	const { colorMode, setColorMode } = useColorMode();

	const toggle = () => {
		const next = colorMode() === "light" ? "dark" : "light";
		setColorMode(next);
		const isDark = next === "dark";
		const root = document.documentElement;
		root.classList.toggle("dark", isDark);
		root.setAttribute("data-kb-theme", isDark ? "dark" : "light");
		try {
			localStorage.setItem("theme", isDark ? "dark" : "light");
		} catch {}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="Toggle color mode"
			onClick={toggle}
			class="transition-transform duration-200 active:scale-95 text-foreground/80 hover:text-foreground"
		>
			<div class="relative h-4 w-4">
				<IconSun
					size={16}
					class={
						(colorMode() === "dark"
							? "opacity-100 rotate-0 scale-100"
							: "opacity-0 -rotate-90 scale-0") +
						" absolute inset-0 m-auto transition-all duration-300"
					}
				/>
				<IconMoon
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


