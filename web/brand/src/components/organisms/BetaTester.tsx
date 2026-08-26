import { For, createSignal } from "solid-js";
import { Headline } from "../atoms/Headline.tsx";
import { Button } from "../atoms/Button.tsx";
import { TextFieldRoot, TextFieldInput } from "../forms/TextField.tsx";
import { AlertInline, AlertTitle, AlertDescription } from "../molecules/AlertInline.tsx";
import { cn } from "../../libs/cn.ts";
import { useBrandT, useLocaleOptional } from "../../i18n/LocaleProvider.tsx";
import { homepageLink } from "../../libs/homepageLinks.ts";
import { subscriptionListKey } from "../../libs/subscriptionList.ts";
import { currentLocale as readCurrentLocale } from "../../libs/currentLocale.ts";

export type BetaTesterProps = {
  endpoint?: string;
  id?: string;
};

const DEFAULT_ENDPOINT = "https://regenfass.eu/.netlify/functions/beta-tester-subscribe";

export default function BetaTester(props: BetaTesterProps = {}) {
  const t = useBrandT();
  const localeContext = useLocaleOptional();
  const [status, setStatus] = createSignal<"idle" | "submitting" | "success" | "error">("idle");
  const [submittedEmail, setSubmittedEmail] = createSignal("");
  const currentLocale = () => readCurrentLocale(localeContext?.locale());

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const locale = currentLocale();
    data.set("language", locale);
    data.set("list", subscriptionListKey("beta", locale));
    const email = data.get("email");
    if (typeof email !== "string" || !email.trim()) return;

    setStatus("submitting");
    try {
      const response = await fetch(props.endpoint ?? DEFAULT_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Beta tester subscription failed");
      setSubmittedEmail(email);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id={props.id ?? "beta-testers"} class="w-full border-y border-border/70 bg-muted/30 dark:bg-muted/15">
      <aside class="site-container py-8 sm:py-10">
        {status() === "success" ? (
          <AlertInline variant="info" class="mx-auto max-w-xl" role="status">
            <AlertTitle>{t("betaTester.successTitle")}</AlertTitle>
            <AlertDescription class="mt-1">
              {t("betaTester.successBodyBefore")} {submittedEmail()} {t("betaTester.successBodyAfter")}
            </AlertDescription>
          </AlertInline>
        ) : (
          <div class="mx-auto flex max-w-3xl flex-col gap-6">
            <div class="max-w-xl">
              <Headline as="h2">
                {t("betaTester.titleBefore")} {" "}
                <span class="bg-gradient-to-br from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                  {t("betaTester.titleHighlight")}
                </span>
              </Headline>
              <p class="mt-3 text-muted-foreground">{t("betaTester.body")}</p>
            </div>
            <div class="rounded-xl border border-border/70 bg-background/60 p-4 sm:p-5">
              <h3 class="font-semibold text-foreground">{t("betaTester.processTitle")}</h3>
              <ol class="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <For each={t("betaTester.processSteps")}>
                  {(step, index) => (
                    <li class="flex gap-3 sm:flex-col">
                      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index() + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  )}
                </For>
              </ol>
            </div>
            <form
              id="form-beta-tester"
              method="post"
              action={props.endpoint ?? DEFAULT_ENDPOINT}
              onSubmit={submit}
              class={cn(
                "flex w-full flex-col gap-3 rounded-2xl border border-input bg-background px-4 py-4",
                "focus-within:ring-2 focus-within:ring-ring hover:ring-2 hover:ring-ring/50",
                "sm:flex-row sm:items-center",
              )}
            >
              <input type="hidden" name="nonce" />
              <input type="hidden" name="language" ref={(element) => { element.value = currentLocale(); }} />
              <input type="hidden" name="list" ref={(element) => { element.value = subscriptionListKey("beta", currentLocale()); }} />
              <TextFieldRoot class="min-w-0 flex-1">
                <TextFieldInput name="name" type="text" autocomplete="name" placeholder={t("betaTester.namePlaceholder")} class="w-full border-0 bg-transparent focus:outline-none" />
              </TextFieldRoot>
              <TextFieldRoot class="min-w-0 flex-1">
                <TextFieldInput name="email" type="email" required autocomplete="email" placeholder={t("betaTester.placeholder")} class="w-full border-0 bg-transparent focus:outline-none" />
              </TextFieldRoot>
              <Button id="button-beta-tester" type="submit" disabled={status() === "submitting"} class="w-full shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white hover:from-sky-700 hover:to-cyan-600 sm:w-auto">
                {status() === "submitting" ? t("a11y.loading") : t("betaTester.subscribe")}
              </Button>
            </form>
            <p class="text-xs text-muted-foreground">
              <a class="underline underline-offset-2 hover:text-foreground" href={homepageLink(currentLocale(), "privacy")}>
                {t("footer.privacy")}
              </a>
            </p>
            {status() === "error" && <p class="text-sm text-destructive" role="alert">{t("betaTester.error")}</p>}
          </div>
        )}
      </aside>
    </section>
  );
}
