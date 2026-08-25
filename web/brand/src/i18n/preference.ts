import {
	DEFAULT_LOCALE,
	isLocale,
	LOCALE_COOKIE_NAME,
	type Locale,
} from "./types.ts";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** Cookie Domain for production hosts under regenfass.eu; omit on localhost / Netlify previews. */
export function cookieDomainForHost(hostname: string): string | undefined {
	const host = hostname.toLowerCase();
	if (host === "regenfass.eu" || host.endsWith(".regenfass.eu")) {
		return ".regenfass.eu";
	}
	return undefined;
}

export function parseLocaleFromCookieString(
	cookieHeader: string | undefined | null,
): Locale | null {
	if (!cookieHeader) return null;
	const parts = cookieHeader.split(";");
	for (const part of parts) {
		const [rawName, ...rest] = part.trim().split("=");
		if (rawName !== LOCALE_COOKIE_NAME) continue;
		const value = decodeURIComponent(rest.join("=").trim());
		if (isLocale(value)) return value;
	}
	return null;
}

export function readLocaleCookie(): Locale | null {
	if (typeof document === "undefined") return null;
	try {
		return parseLocaleFromCookieString(document.cookie);
	} catch {
		return null;
	}
}

export function writeLocaleCookie(locale: Locale): void {
	if (typeof document === "undefined") return;
	try {
		const secure =
			typeof location !== "undefined" && location.protocol === "https:"
				? "; Secure"
				: "";
		const domain = cookieDomainForHost(
			typeof location !== "undefined" ? location.hostname : "",
		);
		const domainAttr = domain ? `; Domain=${domain}` : "";
		document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${domainAttr}${secure}`;
	} catch {
		/* restrictive environments */
	}
}

export function clearLocaleCookie(): void {
	if (typeof document === "undefined") return;
	try {
		const domain = cookieDomainForHost(
			typeof location !== "undefined" ? location.hostname : "",
		);
		const domainAttr = domain ? `; Domain=${domain}` : "";
		document.cookie = `${LOCALE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${domainAttr}`;
		// Also clear host-only variant from older sessions / local dev
		document.cookie = `${LOCALE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
	} catch {
		/* ignore */
	}
}

export function detectBrowserLocale(
	languages: readonly string[] | undefined = typeof navigator !== "undefined"
		? navigator.languages?.length
			? navigator.languages
			: navigator.language
				? [navigator.language]
				: []
		: [],
): Locale {
	for (const tag of languages) {
		const lower = tag.toLowerCase();
		if (lower === "de" || lower.startsWith("de-")) return "de";
		if (lower === "en" || lower.startsWith("en-")) return "en";
	}
	return DEFAULT_LOCALE;
}

/** Cookie override → browser languages → English. */
export function resolveLocale(
	cookieHeader?: string | null,
	languages?: readonly string[],
): Locale {
	const fromCookie =
		cookieHeader === undefined
			? readLocaleCookie()
			: parseLocaleFromCookieString(cookieHeader);
	if (fromCookie) return fromCookie;
	return detectBrowserLocale(languages);
}

/** @internal Reset preference between tests. */
export function resetLocalePreferenceForTests(): void {
	clearLocaleCookie();
}
