import { createMemo } from "solid-js";
import { marked } from "marked";
import changelogMarkdown from "../../../CHANGELOG.md?raw";
import { APP_VERSION, Headline, Link } from "@regenfass/brand";

/** Renders the repo CHANGELOG.md (same notes Release Please puts on GitHub Releases). */
export default function ChangelogSection() {
	const html = createMemo(() =>
		marked.parse(changelogMarkdown, { async: false }) as string,
	);

	return (
		<section id="changelog" class="site-container py-16 sm:py-20 space-y-6">
			<Headline
				as="h2"
				subtitle="Same notes as on GitHub Releases — written by Release Please from Conventional Commits."
			>
				Changelog
			</Headline>
			<p class="text-sm text-muted-foreground">
				Current release:{" "}
				<span class="font-mono text-foreground">v{APP_VERSION}</span>
				{" · "}
				<Link href="https://github.com/ttnleipzig/regenfass/releases">
					Open on GitHub
				</Link>
			</p>
			<article
				class="changelog-prose max-w-none rounded-lg border border-border bg-card/40 p-6 overflow-x-auto"
				innerHTML={html()}
			/>
		</section>
	);
}
