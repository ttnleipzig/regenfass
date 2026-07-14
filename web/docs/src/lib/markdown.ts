import { marked, Renderer } from "marked";

const GITHUB_CONTENT_BASE =
  "https://github.com/ttnleipzig/regenfass/blob/main/web/docs/content";

/** Docsify / legacy cleanup before Markdown → HTML. */
export function preprocessMarkdown(source: string): string {
  let text = source;
  // Docsify tip callouts
  text = text.replace(/^\?>\s+/gm, "> ");
  // Docsify image size hints: ![alt](path ':size=200')
  text = text.replace(/\s*':size=\d+'/g, "");
  // Legacy esp-web-install-button custom element
  text = text.replace(
    /<esp-web-install-button\b[^>]*>\s*<\/esp-web-install-button>/gi,
    "[Open the web installer](https://install.regenfass.eu)",
  );
  // Docsify footer line
  text = text.replace(/\n?\*Made with .*docsify.*\*\s*$/i, "\n");
  // Relative media → public URL
  text = text.replace(
    /(!\[[^\]]*]\()_media\//g,
    "$1/content/_media/",
  );
  text = text.replace(
    /(\[[^\]]*]\()_media\//g,
    "$1/content/_media/",
  );
  // Old regenfass-docs GitHub raw links for media → local
  text = text.replace(
    /https:\/\/raw\.githubusercontent\.com\/[^)\s]+\/_media\//g,
    "/content/_media/",
  );
  return text;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const renderer = new Renderer();
renderer.heading = ({ text, depth }) => {
  const id = slugify(text.replace(/<[^>]+>/g, ""));
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

marked.use({ renderer, gfm: true, breaks: false });

export function renderMarkdown(source: string): string {
  const prepared = preprocessMarkdown(source);
  return marked.parse(prepared, { async: false }) as string;
}

export function editOnGitHubUrl(contentPath: string): string {
  const normalized = contentPath.replace(/^\//, "");
  return `${GITHUB_CONTENT_BASE}/${normalized}`;
}
