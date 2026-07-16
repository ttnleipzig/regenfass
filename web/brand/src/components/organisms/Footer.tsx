import Book from "lucide-solid/icons/book";
import Github from "lucide-solid/icons/github";
import MessageSquare from "lucide-solid/icons/message-square";
import { APP_VERSION } from "../../version.ts";
import { useBrandT } from "../../i18n/LocaleProvider.tsx";

export default function Footer() {
	const t = useBrandT();

	return (
		<footer class="site-container py-6">
			<div class="pt-5 text-xs sm:text-sm  antialiased text-gray-400 border-t border-gray-300 dark:border-gray-00 dark:text-gray-400">
				{/* Mobile links (hidden on md and up) */}
				<nav class="md:hidden mb-4">
					<ul class="flex font-medium text-gray-800 gap-x-3 dark:text-gray-400">
						<li>
							<a
								href="https://docs.regenfass.eu/"
								class="p-2 inline-flex items-center gap-1 hover:text-slate-500 dark:hover:text-white hover:underline"
							>
								<Book size={18} />
								<span>{t("footer.docs")}</span>
							</a>
						</li>
						<li>
							<a
								href="https://github.com/ttnleipzig/regenfass"
								class="p-2 inline-flex items-center gap-1 hover:text-slate-500 dark:hover:text-white hover:underline"
							>
								<Github size={18} />
								<span>{t("footer.github")}</span>
							</a>
						</li>
						<li>
							<a
								href="https://matrix.to/#/#ttn-leipzig:matrix.org"
								class="p-2 inline-flex items-center gap-1 hover:text-slate-500 dark:hover:text-white hover:underline"
							>
								<MessageSquare size={18} />
								<span>{t("footer.matrix")}</span>
							</a>
						</li>
					</ul>
				</nav>
				<address>
					TTN Leipzig, André Lademan, Hardenbergstraße 48, 04275 Leipzig,
					Germany, Europe, United Nations, Milky Way
				</address>
				<p>
					{t("footer.poweredBy")}{" "}
					<a
						href="https://esphome.github.io/esp-web-tools/"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-slate-500 dark:hover:text-white hover:underline"
					>
						ESP Web Tools
					</a>
				</p>
				<p class="mt-2">
					<span class="font-mono">v{APP_VERSION}</span>
					{" · "}
					<a
						href="https://github.com/ttnleipzig/regenfass/releases"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-slate-500 dark:hover:text-white hover:underline"
					>
						{t("footer.releaseNotes")}
					</a>
				</p>
			</div>
		</footer>
	);
}
