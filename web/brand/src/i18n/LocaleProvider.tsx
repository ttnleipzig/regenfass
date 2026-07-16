import {
	createContext,
	createEffect,
	createMemo,
	createSignal,
	useContext,
	type Accessor,
	type ParentComponent,
} from "solid-js";
import {
	flatten,
	resolveTemplate,
	translator,
	type Translator,
} from "@solid-primitives/i18n";
import {
	brandDictionaries,
	type FlatBrandDictionary,
} from "./dictionaries/index.ts";
import {
	resolveLocale,
	writeLocaleCookie,
} from "./preference.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./types.ts";

export type SetLocaleOptions = {
	/** When false, skip onLocaleChange (e.g. syncing from the marketing URL). Default true. */
	announce?: boolean;
};

export type LocaleContextValue = {
	locale: Accessor<Locale>;
	setLocale: (next: Locale, options?: SetLocaleOptions) => void;
	t: Translator<FlatBrandDictionary>;
};

const LocaleContext = createContext<LocaleContextValue>();

export type LocaleProviderProps = {
	/** Initial locale; defaults to cookie → browser → en. */
	initialLocale?: Locale;
	/** Called after locale changes (e.g. marketing URL navigation). */
	onLocaleChange?: (locale: Locale) => void;
};

function applyDocumentLang(locale: Locale) {
	if (typeof document === "undefined") return;
	document.documentElement.lang = locale;
}

export const LocaleProvider: ParentComponent<LocaleProviderProps> = (props) => {
	const initial =
		props.initialLocale && isLocale(props.initialLocale)
			? props.initialLocale
			: resolveLocale();
	const [locale, setLocaleSignal] = createSignal<Locale>(initial);

	createEffect(() => {
		applyDocumentLang(locale());
	});

	const dict = createMemo(() => flatten(brandDictionaries[locale()]));
	const t = translator(dict, resolveTemplate);

	const setLocale = (next: Locale, options?: SetLocaleOptions) => {
		if (!isLocale(next)) return;
		const announce = options?.announce !== false;
		setLocaleSignal(next);
		writeLocaleCookie(next);
		applyDocumentLang(next);
		if (announce) {
			props.onLocaleChange?.(next);
		}
	};

	const value: LocaleContextValue = {
		locale,
		setLocale,
		t,
	};

	return (
		<LocaleContext.Provider value={value}>
			{props.children}
		</LocaleContext.Provider>
	);
};

export function useLocale(): LocaleContextValue {
	const ctx = useContext(LocaleContext);
	if (!ctx) {
		throw new Error("useLocale must be used within a LocaleProvider");
	}
	return ctx;
}

/** Returns brand translator; falls back to English outside LocaleProvider (tests). */
export function useBrandT(): Translator<FlatBrandDictionary> {
	const ctx = useContext(LocaleContext);
	if (ctx) return ctx.t;
	const dict = () => flatten(brandDictionaries[DEFAULT_LOCALE]);
	return translator(dict, resolveTemplate);
}

export function useLocaleOptional(): LocaleContextValue | undefined {
	return useContext(LocaleContext);
}
