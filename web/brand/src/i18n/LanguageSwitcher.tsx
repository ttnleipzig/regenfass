import { For } from "solid-js";
import { Button } from "../components/atoms/Button.tsx";
import { cn } from "../libs/cn.ts";
import { LOCALES, type Locale } from "./types.ts";
import { useLocaleOptional } from "./LocaleProvider.tsx";

const LABELS: Record<Locale, string> = {
	de: "DE",
	en: "EN",
};

/**
 * Compact DE | EN control. Renders nothing outside LocaleProvider.
 */
export function LanguageSwitcher() {
	const ctx = useLocaleOptional();
	if (!ctx) return null;

	const { locale, setLocale, t } = ctx;

	const ariaFor = (code: Locale) =>
		code === "de" ? t("header.switchToDe") : t("header.switchToEn");

	return (
		<div
			role="group"
			aria-label={t("header.language")}
			class="flex items-center text-sm font-medium text-foreground/70"
		>
			<For each={[...LOCALES]}>
				{(code, index) => (
					<span class="contents">
						{index() > 0 ? (
							<span aria-hidden="true" class="px-0.5 text-foreground/40">
								|
							</span>
						) : null}
						<Button
							variant="ghost"
							size="sm"
							aria-label={ariaFor(code)}
							aria-pressed={locale() === code}
							onClick={() => {
								if (locale() !== code) setLocale(code);
							}}
							class={cn(
								"h-8 min-w-8 px-1.5 transition-transform duration-200 active:scale-95",
								locale() === code
									? "text-foreground font-semibold"
									: "text-foreground/60 hover:text-foreground",
							)}
						>
							{LABELS[code]}
						</Button>
					</span>
				)}
			</For>
		</div>
	);
}
