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
import { homepageDictDe } from "./de.ts";
import { homepageDictEn, type HomepageDictionary } from "./en.ts";

export type { HomepageDictionary };
export { homepageDictDe, homepageDictEn };

export const homepageDictionaries: Record<Locale, HomepageDictionary> = {
	de: homepageDictDe,
	en: homepageDictEn,
};

export type FlatHomepageDictionary = Flatten<HomepageDictionary>;

export function useHomepageT(): Translator<FlatHomepageDictionary> {
	const { locale } = useLocale();
	const dict = createMemo(() => flatten(homepageDictionaries[locale()]));
	return translator(dict, resolveTemplate);
}

export function homepageCopy(locale: Locale): HomepageDictionary {
	return homepageDictionaries[locale];
}
