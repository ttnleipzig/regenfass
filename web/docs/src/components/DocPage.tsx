import { Show, createMemo } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Link } from "@regenfass/brand";
import { DOC_PAGES, getMarkdown } from "../lib/content";
import { editOnGitHubUrl, renderMarkdown } from "../lib/markdown";
import { DocsLayout } from "./DocsLayout";

export function DocPage() {
  const location = useLocation();

  const page = createMemo(() => {
    const path = location.pathname.replace(/\/$/, "") || "/";
    return DOC_PAGES[path] ?? DOC_PAGES["/"];
  });

  const html = createMemo(() => {
    const md = getMarkdown(page().contentPath);
    if (!md) {
      return `<p>This page is missing content at <code>${page().contentPath}</code>.</p>`;
    }
    return renderMarkdown(md);
  });

  const githubUrl = createMemo(() => editOnGitHubUrl(page().contentPath));

  return (
    <DocsLayout>
      <article class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
            {page().title}
          </h1>
          <Link href={githubUrl()} class="text-sm shrink-0">
            Edit on GitHub
          </Link>
        </div>
        <div class="docs-prose" innerHTML={html()} />
        <Show when={location.pathname === "/" || location.pathname === ""}>
          <p class="text-sm text-muted-foreground pt-6 border-t border-border">
            Prefer reading offline? Source Markdown lives under{" "}
            <code class="text-xs">web/docs/content/</code> in the main regenfass
            repository.
          </p>
        </Show>
      </article>
    </DocsLayout>
  );
}
