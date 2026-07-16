import { Headline } from "../atoms/Headline.tsx";
import { Button } from "../atoms/Button.tsx";
import {
	TextFieldRoot,
	TextFieldInput,
} from "../forms/TextField.tsx";
import { cn } from "../../libs/cn.ts";
import { useBrandT } from "../../i18n/LocaleProvider.tsx";

export default function Newsletter() {
	const t = useBrandT();

	return (
		<aside id="newsletter" class="site-container py-6">
			<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
				<div class="sm:w-7/12">
					<Headline as="h2">
						{t("newsletter.titleBefore")}{" "}
						<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
							{t("newsletter.titleHighlight")}
						</span>
					</Headline>
					<p class="mt-3 text-muted-foreground">{t("newsletter.body")}</p>
				</div>
				<div class="w-full sm:w-5/12">
					<form
						id="form-newsletter"
						class={cn(
							"flex px-4 py-2 bg-background rounded-full",
							"focus-within:ring-2 focus-within:ring-ring",
							"hover:ring-2 hover:ring-ring/50",
							"border border-input",
						)}
					>
						<TextFieldRoot class="flex-1">
							<TextFieldInput
								type="email"
								class="w-full appearance-none bg-transparent focus:outline-none border-0"
								placeholder={t("newsletter.placeholder")}
							/>
						</TextFieldRoot>
						<Button
							id="button-newsletter"
							class="px-3 py-1 ml-2 text-sm font-semibold rounded-full shrink-0 bg-gradient-to-br from-sky-500 to-cyan-400 hover:from-sky-700 hover:to-cyan-600 text-white"
							type="submit"
						>
							{t("newsletter.subscribe")}
						</Button>
					</form>
				</div>
			</div>
		</aside>
	);
}
