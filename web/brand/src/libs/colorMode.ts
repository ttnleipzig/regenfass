/** localStorage key used by @kobalte/core ColorModeProvider */
export const KB_COLOR_MODE_STORAGE_KEY = "kb-color-mode";

/** Legacy key written by ButtonModeToggle before Kobalte sync */
export const LEGACY_THEME_STORAGE_KEY = "theme";

export type ResolvedColorMode = "light" | "dark";

/**
 * Resolve the effective light/dark mode from storage or system preference.
 * Treats Kobalte's `"system"` value (and missing keys) as matchMedia.
 */
export function resolveColorMode(): ResolvedColorMode {
	try {
		const saved =
			localStorage.getItem(KB_COLOR_MODE_STORAGE_KEY) ??
			localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
		if (saved === "light" || saved === "dark") return saved;
	} catch {
		/* ignore */
	}
	const prefersDark =
		typeof window !== "undefined" &&
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;
	return prefersDark ? "dark" : "light";
}

/**
 * Apply both Tailwind `.dark` and Kobalte `data-kb-theme` so token CSS and
 * `dark:` utilities stay in sync.
 */
export function applyColorMode(mode: ResolvedColorMode): void {
	const root = document.documentElement;
	const isDark = mode === "dark";
	root.classList.toggle("dark", isDark);
	root.setAttribute("data-kb-theme", mode);
	root.style.colorScheme = mode;
}

/** Persist explicit light/dark for both Kobalte and legacy readers. */
export function persistColorMode(mode: ResolvedColorMode): void {
	try {
		localStorage.setItem(KB_COLOR_MODE_STORAGE_KEY, mode);
		localStorage.setItem(LEGACY_THEME_STORAGE_KEY, mode);
	} catch {
		/* ignore */
	}
}

/**
 * Bootstrap color mode before first paint / Solid hydrate.
 * Call once at app entry (and mirror as a blocking script in index.html).
 */
export function initColorMode(): void {
	try {
		applyColorMode(resolveColorMode());
	} catch {
		/* ignore */
	}
}
