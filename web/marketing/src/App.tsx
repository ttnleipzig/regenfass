import { For, Show, createEffect, type ParentProps } from "solid-js";
import {
	Navigate,
	Route,
	Router,
	useNavigate,
	useParams,
	type RouteSectionProps,
} from "@solidjs/router";
import {
	Badge,
	ButtonPrimary,
	ButtonSecondary,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Footer,
	Header,
	Headline,
	isLocale,
	Link,
	LocaleProvider,
	Newsletter,
	resolveLocale,
	trackEvent,
	useLocale,
	type HeaderNavItem,
	type Locale,
} from "@regenfass/brand";
import ChangelogSection from "./ChangelogSection";
import { marketingCopy, useMarketingT } from "./i18n/index.ts";
import { localeRedirectPath } from "./i18n/localeRouting.ts";
import { applyMarketingSeo } from "./i18n/seo.ts";

const DOCS_URL = "https://docs.regenfass.eu/";
const INSTALLER_URL = "https://install.regenfass.eu";

function trackNavigateToDocs() {
	trackEvent("navigate_to_docs");
}

function trackNavigateToInstaller() {
	trackEvent("navigate_to_installer");
}

function LocaleRedirect() {
	const hash = typeof location !== "undefined" ? location.hash : "";
	return <Navigate href={localeRedirectPath(undefined, undefined, hash)} />;
}

function InvalidLocaleRedirect() {
	return <Navigate href={localeRedirectPath()} />;
}

function Shell(props: ParentProps & { lang: Locale }) {
	const t = useMarketingT();
	const base = `/${props.lang}`;

	const navItems = (): HeaderNavItem[] => [
		{ href: base, label: t("nav.home") },
		{ href: `${base}#changelog`, label: t("nav.changelog") },
		{
			href: DOCS_URL,
			label: t("nav.docs"),
			external: true,
			onClick: trackNavigateToDocs,
		},
		{
			href: INSTALLER_URL,
			label: t("nav.installer"),
			external: true,
			onClick: trackNavigateToInstaller,
		},
		{
			href: "https://brand.regenfass.eu",
			label: t("nav.brand"),
			external: true,
		},
		{
			href: "https://github.com/ttnleipzig/regenfass",
			label: t("nav.github"),
			external: true,
		},
	];

	return (
		<div class="min-h-screen flex flex-col">
			<Header title="Regenfass" navItems={navItems()} />
			<main class="flex-1">{props.children}</main>
			<Footer />
		</div>
	);
}

function Home() {
	const params = useParams();
	const { locale, setLocale } = useLocale();
	const t = useMarketingT();
	const copy = () => marketingCopy(locale());

	createEffect(() => {
		const lang = params.lang;
		if (!isLocale(lang)) return;
		if (locale() !== lang) {
			setLocale(lang, { announce: false });
		}
		applyMarketingSeo(lang);
	});

	return (
		<Show
			when={isLocale(params.lang) ? params.lang : null}
			fallback={<InvalidLocaleRedirect />}
		>
			{(lang) => (
				<Shell lang={lang()}>
					<section class="relative overflow-hidden hero-glow">
						<div
							class="absolute inset-0 grid-quiet pointer-events-none"
							aria-hidden="true"
						/>
						<div class="site-container relative py-20 sm:py-28 lg:py-32">
							<p class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-400 bg-clip-text">
								Regenfass
							</p>
							<h1 class="mt-4 max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
								{t("hero.headline")}
							</h1>
							<p class="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
								{t("hero.body")}
							</p>
							<div class="mt-8 flex flex-wrap items-center gap-3">
								<a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
									<ButtonPrimary class="px-5 py-2.5 text-base">
										{t("hero.ctaStart")}
									</ButtonPrimary>
								</a>
								<a href={DOCS_URL} onClick={trackNavigateToDocs}>
									<ButtonSecondary class="px-5 py-2.5 text-base">
										{t("hero.ctaDocs")}
									</ButtonSecondary>
								</a>
							</div>
						</div>
					</section>

					<section class="site-container py-16 sm:py-20 space-y-8">
						<Headline as="h2" subtitle={t("why.subtitle")}>
							{t("why.title")}
						</Headline>
						<div class="grid gap-4 sm:grid-cols-3">
							<For each={[...copy().why.items]}>
								{(item) => (
									<Card>
										<CardHeader>
											<CardTitle>{item.title}</CardTitle>
											<CardDescription>{item.body}</CardDescription>
										</CardHeader>
									</Card>
								)}
							</For>
						</div>
					</section>

					<section class="border-y border-border bg-card/40">
						<div class="site-container py-16 sm:py-20 space-y-8">
							<Headline as="h2" subtitle={t("how.subtitle")}>
								{t("how.title")}
							</Headline>
							<ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
								<For each={[...copy().how.steps]}>
									{(item) => (
										<li class="rounded-lg border border-border bg-background p-4 space-y-2">
											<Badge class="font-mono">{item.step}</Badge>
											<p class="font-semibold text-foreground">{item.title}</p>
											<p class="text-sm text-muted-foreground">{item.body}</p>
										</li>
									)}
								</For>
							</ol>
						</div>
					</section>

					<section class="site-container py-16 sm:py-20 space-y-8">
						<Headline as="h2" subtitle={t("hardware.subtitle")}>
							{t("hardware.title")}
						</Headline>
						<div class="grid gap-6 sm:grid-cols-3">
							<For each={[...copy().hardware.items]}>
								{(item) => (
									<Card>
										<CardHeader class="items-start gap-3">
											<img
												src={item.src}
												alt=""
												class="h-24 w-auto object-contain"
												loading="lazy"
											/>
											<CardTitle>{item.title}</CardTitle>
											<CardDescription>{item.body}</CardDescription>
										</CardHeader>
									</Card>
								)}
							</For>
						</div>
						<p class="text-sm text-muted-foreground">
							{t("hardware.docsBefore")}{" "}
							<Link href={DOCS_URL} onClick={trackNavigateToDocs}>
								{t("hardware.docsLink")}
							</Link>
							{t("hardware.docsAfter")}
						</p>
					</section>

					<section class="border-y border-border bg-card/40">
						<div class="site-container py-16 sm:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
							<div class="space-y-4">
								<Headline as="h2">{t("software.title")}</Headline>
								<p class="text-muted-foreground max-w-prose">{t("software.body")}</p>
								<div class="flex flex-wrap gap-3 pt-2">
									<a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
										<ButtonPrimary>{t("software.openInstaller")}</ButtonPrimary>
									</a>
									<Link href="https://github.com/ttnleipzig/regenfass">
										{t("software.viewSource")}
									</Link>
								</div>
							</div>
							<Card>
								<CardHeader>
									<CardTitle>{t("software.whatYouGet")}</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2 text-sm text-muted-foreground">
									<For each={[...copy().software.bullets]}>
										{(bullet) => <p>• {bullet}</p>}
									</For>
								</CardContent>
							</Card>
						</div>
					</section>

					<section class="site-container py-16 sm:py-20 space-y-8">
						<Headline as="h2">{t("cases.title")}</Headline>
						<div class="grid gap-4 sm:grid-cols-3">
							<For each={[...copy().cases.items]}>
								{(item) => (
									<Card>
										<CardHeader>
											<CardTitle>{item.title}</CardTitle>
											<CardDescription>{item.body}</CardDescription>
										</CardHeader>
									</Card>
								)}
							</For>
						</div>
					</section>

					<ChangelogSection />

					<section class="border-t border-border bg-gradient-to-br from-sky-600/10 to-cyan-500/5">
						<div class="site-container py-14 sm:py-16 space-y-6">
							<Headline as="h2" align="center">
								{t("cta.title")}
							</Headline>
							<p class="text-center text-muted-foreground max-w-xl mx-auto">
								{t("cta.body")}
							</p>
							<div class="flex flex-wrap justify-center gap-3">
								<a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
									<ButtonPrimary class="px-5 py-2.5">{t("cta.ctaStart")}</ButtonPrimary>
								</a>
								<a href={DOCS_URL} onClick={trackNavigateToDocs}>
									<ButtonSecondary class="px-5 py-2.5">
										{t("cta.ctaDocs")}
									</ButtonSecondary>
								</a>
							</div>
							<div class="max-w-lg mx-auto pt-4">
								<Newsletter />
							</div>
						</div>
					</section>
				</Shell>
			)}
		</Show>
	);
}

function initialMarketingLocale(): Locale {
	if (typeof location !== "undefined") {
		const segment = location.pathname.split("/").filter(Boolean)[0];
		if (isLocale(segment)) return segment;
	}
	return resolveLocale();
}

function MarketingRoot(props: RouteSectionProps) {
	const navigate = useNavigate();

	return (
		<LocaleProvider
			initialLocale={initialMarketingLocale()}
			onLocaleChange={(next) => {
				const hash = typeof location !== "undefined" ? location.hash : "";
				navigate(`/${next}${hash}`);
			}}
		>
			{props.children}
		</LocaleProvider>
	);
}

export default function App() {
	return (
		<Router root={MarketingRoot}>
			<Route path="/" component={LocaleRedirect} />
			<Route path="/:lang" component={Home} />
		</Router>
	);
}
