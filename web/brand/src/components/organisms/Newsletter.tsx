import { Headline } from "../atoms/Headline.tsx";
import { Button } from "../atoms/Button.tsx";
import { TextFieldRoot, TextFieldInput } from "../forms/TextField.tsx";
import { cn } from "../../libs/cn.ts";
import { useBrandT } from "../../i18n/LocaleProvider.tsx";

export default function Newsletter() {
	const t = useBrandT();

	return (
		<aside id="newsletter" class="site-container py-6">
			<div class="flex flex-col gap-6">
				<div class="max-w-xl">
					<Headline as="h2">
						{t("newsletter.titleBefore")}{" "}
						<span class="text-transparent bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text">
							{t("newsletter.titleHighlight")}
						</span>
					</Headline>
					<p class="mt-3 text-muted-foreground">{t("newsletter.body")}</p>
				</div>
				<div class="w-full max-w-2xl">
					<form
						id="form-newsletter"
						method="post"
						action="https://news.regenfass.eu/subscription/form"
						class={cn(
							"listmonk-form",
							"flex w-full flex-col gap-3 px-4 py-4 bg-background rounded-2xl",
							"focus-within:ring-2 focus-within:ring-ring",
							"hover:ring-2 hover:ring-ring/50",
							"border border-input",
						)}
					>
						<input type="hidden" name="nonce" />
						<TextFieldRoot class="min-w-0 flex-1">
							<TextFieldInput
								name="email"
								type="email"
								required
								class="w-full appearance-none bg-transparent focus:outline-none border-0"
								placeholder={t("newsletter.placeholder")}
							/>
						</TextFieldRoot>
						<Button
							id="button-newsletter"
							class="w-full px-4 py-2 text-sm font-semibold rounded-full shrink-0 bg-gradient-to-br from-sky-500 to-cyan-400 hover:from-sky-700 hover:to-cyan-600 text-white sm:w-auto"
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
