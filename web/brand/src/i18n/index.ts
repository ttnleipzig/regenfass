export {
	DEFAULT_LOCALE,
	isLocale,
	LOCALE_COOKIE_NAME,
	LOCALES,
	type Locale,
} from "./types.ts";
export {
	clearLocaleCookie,
	cookieDomainForHost,
	detectBrowserLocale,
	parseLocaleFromCookieString,
	readLocaleCookie,
	resetLocalePreferenceForTests,
	resolveLocale,
	writeLocaleCookie,
} from "./preference.ts";
export {
	LocaleProvider,
	useBrandT,
	useLocale,
	useLocaleOptional,
	type LocaleContextValue,
	type LocaleProviderProps,
} from "./LocaleProvider.tsx";
export { LanguageSwitcher } from "./LanguageSwitcher.tsx";
export {
	brandDictDe,
	brandDictEn,
	brandDictionaries,
	flatBrandDictionary,
	type BrandDictionary,
	type FlatBrandDictionary,
} from "./dictionaries/index.ts";
