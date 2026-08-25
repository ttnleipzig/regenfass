import { createMemo } from "solid-js";
import {
	flatten,
	resolveTemplate,
	translator,
	type Flatten,
	type Translator,
} from "@solid-primitives/i18n";
import {
	resolveLocale,
	useLocaleOptional,
	type Locale,
} from "@regenfass/brand";
import { installerDictDe } from "./de.ts";
import { installerDictEn, type InstallerDictionary } from "./en.ts";

export type { InstallerDictionary };
export { installerDictDe, installerDictEn };

export const installerDictionaries: Record<Locale, InstallerDictionary> = {
	de: installerDictDe,
	en: installerDictEn,
};

export type FlatInstallerDictionary = Flatten<InstallerDictionary>;

/** Falls back to resolveLocale() outside LocaleProvider (tests / early boot). */
export function useInstallerT(): Translator<FlatInstallerDictionary> {
	const ctx = useLocaleOptional();
	const dict = createMemo(() =>
		flatten(installerDictionaries[ctx?.locale() ?? resolveLocale()]),
	);
	return translator(dict, resolveTemplate);
}

/** Non-reactive messages for thrown errors (reads cookie/browser locale). */
export function installerMessage(
	path: keyof FlatInstallerDictionary,
	args?: Record<string, string | number | boolean>,
): string {
	const flat = flatten(installerDictionaries[resolveLocale()]);
	const value = flat[path];
	if (typeof value !== "string") {
		return String(value ?? path);
	}
	if (!args) return value;
	return resolveTemplate(value, args);
}
