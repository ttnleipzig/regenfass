import { isLocale, resolveLocale, type Locale } from "@regenfass/brand";

/** Resolve `/` redirect target, preserving hash. */
export function localeRedirectPath(
	cookieHeader?: string | null,
	languages?: readonly string[],
	hash = "",
): string {
	return `/${resolveLocale(cookieHeader, languages)}${hash}`;
}

/** Normalize `/:lang` — return locale or null when invalid. */
export function parseLocaleParam(lang: string | undefined): Locale | null {
	return isLocale(lang) ? lang : null;
}
