import { Headline } from "../atoms/Headline.tsx";
import { Button } from "../atoms/Button.tsx";
import { TextFieldRoot, TextFieldInput } from "../forms/TextField.tsx";
import { AlertInline, AlertTitle, AlertDescription } from "../molecules/AlertInline.tsx";
import { cn } from "../../libs/cn.ts";
import {
	useBrandT,
	useLocaleOptional,
} from "../../i18n/LocaleProvider.tsx";
import { createSignal } from "solid-js";
import { homepageLink } from "../../libs/homepageLinks.ts";
import { subscriptionListKey } from "../../libs/subscriptionList.ts";
import { currentLocale as readCurrentLocale } from "../../libs/currentLocale.ts";

export type NewsletterProps = {
	/** Central endpoint that enriches Listmonk subscriptions with the locale. */
	endpoint?: string;
};

const DEFAULT_ENDPOINT =
	"https://regenfass.eu/.netlify/functions/newsletter-subscribe";

export default function Newsletter(props: NewsletterProps = {}) {
	const t = useBrandT();
	const localeContext = useLocaleOptional();
	const [status, setStatus] = createSignal<"idle" | "submitting" | "success" | "error">("idle");
	const [submittedEmail, setSubmittedEmail] = createSignal("");

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const locale = currentLocale();
		data.set("language", locale);
		data.set("list", subscriptionListKey("news", locale));
		const email = data.get("email");
		if (typeof email !== "string") return;

		setStatus("submitting");
		try {
			const response = await fetch(props.endpoint ?? DEFAULT_ENDPOINT, {
				method: "POST",
				body: data,
				headers: { Accept: "application/json" },
			});
			if (!response.ok) throw new Error("Newsletter subscription failed");
			setSubmittedEmail(email);
			setStatus("success");
			form.reset();
		} catch {
			setStatus("error");
		}
	};

	const currentLocale = () => readCurrentLocale(localeContext?.locale());

	return (
		<section class="w-full border-y border-border/70 bg-muted/30 dark:bg-muted/15">
		<aside id="newsletter" class="site-container py-8 sm:py-10">
			{status() === "success" ? (
				<AlertInline variant="info" class="max-w-xl" role="status">
					<AlertTitle>{t("newsletter.successTitle")}</AlertTitle>
					<AlertDescription class="mt-1">
						{t("newsletter.successBodyBefore")} {submittedEmail()} {t("newsletter.successBodyAfter")}
					</AlertDescription>
				</AlertInline>
			) : (
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
						action={props.endpoint ?? DEFAULT_ENDPOINT}
						onSubmit={submit}
						class={cn(
							"listmonk-form",
							"flex w-full flex-col gap-3 px-4 py-4 bg-background rounded-2xl sm:flex-row sm:items-center",
							"focus-within:ring-2 focus-within:ring-ring",
							"hover:ring-2 hover:ring-ring/50",
							"border border-input",
						)}
					>
						<input type="hidden" name="nonce" />
						<input type="hidden" name="language" ref={(element) => { element.value = currentLocale(); }} />
						<input type="hidden" name="list" ref={(element) => { element.value = subscriptionListKey("news", currentLocale()); }} />
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
					<p class="mt-3 text-xs text-muted-foreground">
						<a class="underline underline-offset-2 hover:text-foreground" href={homepageLink(currentLocale(), "privacy")}>
							{t("footer.privacy")}
						</a>
					</p>
					{status() === "error" && (
						<p class="mt-3 text-sm text-destructive" role="alert">
							{t("newsletter.error")}
						</p>
					)}
				</div>
			</div>
			)}
		</aside>
		</section>
	);
}
