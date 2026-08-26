import Book from "lucide-solid/icons/book";
import Github from "lucide-solid/icons/github";
import MessageSquare from "lucide-solid/icons/message-square";
import { createSignal, onMount } from "solid-js";
import { APP_VERSION } from "../../version.ts";
import { useBrandT } from "../../i18n/LocaleProvider.tsx";

export default function Footer() {
	const t = useBrandT();
	const [releaseVersion, setReleaseVersion] = createSignal(APP_VERSION);

	onMount(() => {
		void fetch("https://api.github.com/repos/ttnleipzig/regenfass/releases/latest", {
			headers: { Accept: "application/vnd.github+json" },
		})
			.then((response) => (response.ok ? response.json() : null))
			.then((release: unknown) => {
				if (
					typeof release === "object" &&
					release !== null &&
					"tag_name" in release &&
					typeof release.tag_name === "string" &&
					release.tag_name.length > 0
				) {
					setReleaseVersion(release.tag_name.replace(/^v/, ""));
				}
			})
			.catch(() => {
				// Keep the build-time version when GitHub is unavailable.
			});
	});

	return (
		<footer class="w-full overflow-hidden border-t-4 border-primary bg-gradient-to-br from-card via-card/80 to-primary/5">
			<div class="relative">
				<div aria-hidden="true" class="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-3xl" />
				<div class="site-container relative flex flex-col gap-8 py-8 sm:py-10 md:flex-row md:items-end md:justify-between">
					<div class="max-w-xl space-y-4">
						<div>
							<p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
								Regenfass · Open-source IoT
							</p>
							<address class="mt-3 not-italic text-sm leading-6 text-muted-foreground">
								TTN Leipzig, André Lademan, Hardenbergstraße 48, 04275 Leipzig,
								Germany, Europe, United Nations, Milky Way
							</address>
						</div>
						<p class="max-w-lg text-sm leading-6 text-foreground/80">
							Regenfass is a project by{" "}
							<a
								href="https://ttn-leipzig.de"
								target="_blank"
								rel="noopener noreferrer"
								class="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
							>
								TTN Leipzig user group
							</a>
							.
						</p>
					</div>

					<div class="space-y-4 md:min-w-56 md:text-right">
						<nav aria-label="Footer links">
							<ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium md:justify-end">
								<li>
									<a
										href="https://docs.regenfass.eu/"
										class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
									>
										<Book size={15} />
										<span>{t("footer.docs")}</span>
									</a>
								</li>
								<li>
									<a
										href="https://github.com/ttnleipzig/regenfass"
										class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
									>
										<Github size={15} />
										<span>{t("footer.github")}</span>
									</a>
								</li>
								<li>
									<a
										href="https://matrix.to/#/#ttn-leipzig:matrix.org"
										class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
									>
										<MessageSquare size={15} />
										<span>{t("footer.matrix")}</span>
									</a>
								</li>
							</ul>
						</nav>
						<p class="text-xs text-muted-foreground">
							<span class="font-mono" aria-live="polite">v{releaseVersion()}</span>
							<span class="mx-1.5 text-border">·</span>
							<a
								href="https://github.com/ttnleipzig/regenfass/releases"
								target="_blank"
								rel="noopener noreferrer"
								class="transition-colors hover:text-foreground"
							>
								{t("footer.releaseNotes")}
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
