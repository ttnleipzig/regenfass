import { afterEach, describe, expect, it } from "vitest";
import {
	cookieDomainForHost,
	detectBrowserLocale,
	parseLocaleFromCookieString,
	resetLocalePreferenceForTests,
	resolveLocale,
	writeLocaleCookie,
	readLocaleCookie,
	LOCALE_COOKIE_NAME,
} from "@regenfass/brand";

describe("locale preference", () => {
	afterEach(() => {
		resetLocalePreferenceForTests();
	});

	it("cookieDomainForHost uses .regenfass.eu for production hosts", () => {
		expect(cookieDomainForHost("regenfass.eu")).toBe(".regenfass.eu");
		expect(cookieDomainForHost("install.regenfass.eu")).toBe(".regenfass.eu");
		expect(cookieDomainForHost("localhost")).toBeUndefined();
		expect(cookieDomainForHost("regenfass-marketing.netlify.app")).toBeUndefined();
	});

	it("detectBrowserLocale prefers German tags", () => {
		expect(detectBrowserLocale(["de-DE", "en-US"])).toBe("de");
		expect(detectBrowserLocale(["en-GB"])).toBe("en");
		expect(detectBrowserLocale(["fr-FR"])).toBe("en");
	});

	it("parseLocaleFromCookieString reads regenfass-locale", () => {
		expect(
			parseLocaleFromCookieString(`${LOCALE_COOKIE_NAME}=de; other=1`),
		).toBe("de");
		expect(parseLocaleFromCookieString("other=1")).toBeNull();
		expect(parseLocaleFromCookieString(`${LOCALE_COOKIE_NAME}=fr`)).toBeNull();
	});

	it("resolveLocale prefers cookie over browser languages", () => {
		expect(resolveLocale(`${LOCALE_COOKIE_NAME}=de`, ["en-US"])).toBe("de");
		expect(resolveLocale("", ["de-DE"])).toBe("de");
		expect(resolveLocale("", ["en-US"])).toBe("en");
	});

	it("writeLocaleCookie persists override readable via readLocaleCookie", () => {
		writeLocaleCookie("de");
		expect(readLocaleCookie()).toBe("de");
		expect(resolveLocale()).toBe("de");
	});
});
