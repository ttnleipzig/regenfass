import { createMemo } from "solid-js";
import {
	flatten,
	resolveTemplate,
	translator,
	type Flatten,
	type Translator,
} from "@solid-primitives/i18n";
import {
	useLocale,
	type Locale,
} from "@regenfass/brand";
import { marketingDictDe } from "./de.ts";
import { marketingDictEn, type MarketingDictionary } from "./en.ts";

export type { MarketingDictionary };
export { marketingDictDe, marketingDictEn };

export const marketingDictionaries: Record<Locale, MarketingDictionary> = {
	de: marketingDictDe,
	en: marketingDictEn,
};

export type FlatMarketingDictionary = Flatten<MarketingDictionary>;

export function useMarketingT(): Translator<FlatMarketingDictionary> {
	const { locale } = useLocale();
	const dict = createMemo(() => flatten(marketingDictionaries[locale()]));
	return translator(dict, resolveTemplate);
}

export function marketingCopy(locale: Locale): MarketingDictionary {
	return marketingDictionaries[locale];
}
