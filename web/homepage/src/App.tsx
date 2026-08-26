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
	Button,
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
import { homepageCopy, useHomepageT } from "./i18n/index.ts";
import { localeRedirectPath } from "./i18n/localeRouting.ts";
import { applyHomepageSeo } from "./i18n/seo.ts";

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
	const t = useHomepageT();
	const base = `/${props.lang}`;

	const navItems = (): HeaderNavItem[] => [
		{
			href: base,
			label: t("nav.home"),
			children: [{ href: `${base}/changelog`, label: t("nav.changelog") }],
		},
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
			href: "https://github.com/ttnleipzig/regenfass",
			label: t("nav.github"),
			external: true,
		},
	];

	return (
		<div class="min-h-screen flex flex-col">
			<Header title="regenfass" navItems={navItems()} />
			<main class="flex-1">{props.children}</main>
			<Footer />
		</div>
	);
}

function syncRouteLocale(lang: () => string | undefined) {
	const { locale, setLocale } = useLocale();

	createEffect(() => {
		const nextLang = lang();
		if (!isLocale(nextLang)) return;
		if (locale() !== nextLang) {
			setLocale(nextLang, { announce: false });
		}
		applyHomepageSeo(nextLang);
	});
}

function Home() {
	const params = useParams();
	const navigate = useNavigate();
	const { locale } = useLocale();
	const t = useHomepageT();
	const copy = () => homepageCopy(locale());

	syncRouteLocale(() => params.lang);

	createEffect(() => {
		if (typeof location === "undefined") return;
		if (!isLocale(params.lang)) return;
		if (location.hash === "#changelog") {
			navigate(`/${params.lang}/changelog`, { replace: true });
		}
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
						<div class="site-container relative grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)] lg:gap-14 lg:py-24">
							<div>
								<p class="inline-block pb-1 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-transparent bg-gradient-to-br from-sky-600 to-cyan-400 bg-clip-text">
									regenfass
								</p>
								<h1 class="mt-4 max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
									{t("hero.headline")}
								</h1>
								<p class="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground">
									{t("hero.body")}
								</p>
								<div class="mt-8 flex flex-wrap items-center gap-3">
									<a href={INSTALLER_URL} onClick={trackNavigateToInstaller}>
										<Button variant="primary" class="px-5 py-2.5 text-base">
											{t("hero.ctaStart")}
										</Button>
									</a>
									<a href={DOCS_URL} onClick={trackNavigateToDocs}>
										<Button variant="secondary" class="px-5 py-2.5 text-base">
											{t("hero.ctaDocs")}
										</Button>
									</a>
								</div>
							</div>
							<figure class="hero-visual relative mx-auto w-full max-w-lg lg:max-w-none" aria-label="IBC container with waterproof ultrasonic level sensor">
								<img
									src="/img/ibc-container-sketch.png"
									alt="Technical sketch of an IBC container with a waterproof ultrasonic level sensor and a compact electronics enclosure"
									class="relative z-10 h-auto w-full -scale-x-100"
									fetchpriority="high"
								/>
							</figure>
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
														class="mx-auto h-24 w-auto object-contain"
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
										<Button variant="primary">{t("software.openInstaller")}</Button>
									</a>
									<Link
										href="https://github.com/ttnleipzig/regenfass"
										class="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-primary underline-offset-4 hover:bg-primary/10 hover:no-underline"
									>
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
									<Button variant="primary" class="px-5 py-2.5">{t("cta.ctaStart")}</Button>
								</a>
								<a href={DOCS_URL} onClick={trackNavigateToDocs}>
									<Button variant="secondary" class="px-5 py-2.5">
										{t("cta.ctaDocs")}
									</Button>
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

function ChangelogPage() {
	const params = useParams();

	syncRouteLocale(() => params.lang);

	return (
		<Show
			when={isLocale(params.lang) ? params.lang : null}
			fallback={<InvalidLocaleRedirect />}
		>
			{(lang) => (
				<Shell lang={lang()}>
					<ChangelogSection />
				</Shell>
			)}
		</Show>
	);
}

function initialHomepageLocale(): Locale {
	if (typeof location !== "undefined") {
		const segment = location.pathname.split("/").filter(Boolean)[0];
		if (isLocale(segment)) return segment;
	}
	return resolveLocale();
}

function HomepageRoot(props: RouteSectionProps) {
	const navigate = useNavigate();

	return (
		<LocaleProvider
			initialLocale={initialHomepageLocale()}
			onLocaleChange={(next) => {
				if (typeof location === "undefined") {
					navigate(`/${next}`);
					return;
				}

				const [, ...rest] = location.pathname.split("/").filter(Boolean);
				const suffix = rest.length > 0 ? `/${rest.join("/")}` : "";
				navigate(`/${next}${suffix}${location.hash}`);
			}}
		>
			{props.children}
		</LocaleProvider>
	);
}

export default function App() {
	return (
		<Router root={HomepageRoot}>
			<Route path="/" component={LocaleRedirect} />
			<Route path="/:lang" component={Home} />
			<Route path="/:lang/changelog" component={ChangelogPage} />
		</Router>
	);
}
