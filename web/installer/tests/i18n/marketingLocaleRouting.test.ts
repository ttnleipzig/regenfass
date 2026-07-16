import { describe, expect, it } from "vitest";
import {
	localeRedirectPath,
	parseLocaleParam,
} from "../../../../marketing/src/i18n/localeRouting.ts";
import { LOCALE_COOKIE_NAME } from "@regenfass/brand";

describe("marketing locale routing helpers", () => {
	it("redirects / to cookie locale and preserves hash", () => {
		expect(
			localeRedirectPath(`${LOCALE_COOKIE_NAME}=de`, ["en-US"], "#changelog"),
		).toBe("/de#changelog");
		expect(localeRedirectPath("", ["en-GB"], "")).toBe("/en");
	});

	it("accepts only de|en path segments", () => {
		expect(parseLocaleParam("de")).toBe("de");
		expect(parseLocaleParam("en")).toBe("en");
		expect(parseLocaleParam("fr")).toBeNull();
		expect(parseLocaleParam(undefined)).toBeNull();
	});
});
