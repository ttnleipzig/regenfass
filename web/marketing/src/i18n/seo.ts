import type { Locale } from "@regenfass/brand";
import { marketingCopy } from "./index.ts";

const SITE_ORIGIN = "https://regenfass.eu";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
	let el = document.head.querySelector(selector);
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute(attr, key);
		document.head.appendChild(el);
	}
	el.setAttribute("content", content);
}

function upsertLink(rel: string, hreflang: string | undefined, href: string) {
	const selector = hreflang
		? `link[rel="${rel}"][hreflang="${hreflang}"]`
		: `link[rel="${rel}"]:not([hreflang])`;
	let el = document.head.querySelector(selector) as HTMLLinkElement | null;
	if (!el) {
		el = document.createElement("link");
		el.rel = rel;
		if (hreflang) el.hreflang = hreflang;
		document.head.appendChild(el);
	}
	el.href = href;
}

/** Update document title, description, canonical, and hreflang for the active locale. */
export function applyMarketingSeo(locale: Locale) {
	const copy = marketingCopy(locale);
	document.title = copy.meta.title;
	document.documentElement.lang = locale;

	upsertMeta('meta[name="description"]', "name", "description", copy.meta.description);

	const canonical = `${SITE_ORIGIN}/${locale}`;
	upsertLink("canonical", undefined, canonical);
	upsertLink("alternate", "de", `${SITE_ORIGIN}/de`);
	upsertLink("alternate", "en", `${SITE_ORIGIN}/en`);
	upsertLink("alternate", "x-default", `${SITE_ORIGIN}/en`);
}
