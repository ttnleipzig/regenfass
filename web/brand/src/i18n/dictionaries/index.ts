import { flatten, type Flatten } from "@solid-primitives/i18n";
import type { Locale } from "../types.ts";
import { brandDictDe } from "./de.ts";
import { brandDictEn, type BrandDictionary } from "./en.ts";

export type { BrandDictionary };
export { brandDictDe, brandDictEn };

export const brandDictionaries: Record<Locale, BrandDictionary> = {
	de: brandDictDe,
	en: brandDictEn,
};

export type FlatBrandDictionary = Flatten<BrandDictionary>;

export function flatBrandDictionary(locale: Locale): FlatBrandDictionary {
	return flatten(brandDictionaries[locale]);
}
