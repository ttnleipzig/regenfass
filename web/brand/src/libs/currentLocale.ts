import type { Locale } from "../i18n/types.ts";

/** Reads the active locale and tolerates the short route/provider handoff. */
export function currentLocale(locale?: Locale): Locale {
	if (locale === "de" || locale === "en") return locale;
	if (typeof window !== "undefined") {
		const routeLocale = window.location.pathname.split("/").filter(Boolean)[0];
		if (routeLocale === "de" || routeLocale === "en") return routeLocale;
	}
	if (typeof document !== "undefined" && document.documentElement.lang === "de") return "de";
	return "en";
}
