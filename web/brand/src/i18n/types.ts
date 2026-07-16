export const LOCALES = ["de", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE_NAME = "regenfass-locale";

export function isLocale(value: string | null | undefined): value is Locale {
	return value === "de" || value === "en";
}
