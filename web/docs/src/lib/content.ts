/** Eager raw Markdown imports keyed by content-relative path. */
const modules = import.meta.glob("../../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function toContentPath(globKey: string): string {
  // e.g. ../../content/README.md → README.md
  return globKey.replace(/^\.\.\/\.\.\/content\//, "");
}

const byPath = new Map<string, string>();
for (const [key, value] of Object.entries(modules)) {
  byPath.set(toContentPath(key), value);
}

export function getMarkdown(contentPath: string): string | undefined {
  return byPath.get(contentPath);
}

export function listMarkdownPaths(): string[] {
  return [...byPath.keys()].sort();
}

export type DocPage = {
  contentPath: string;
  title: string;
};

export const DOC_PAGES: Record<string, DocPage> = {
  "/": { contentPath: "README.md", title: "Regenfass documentation" },
  "/hardware/sensors": {
    contentPath: "Hardware/Sensors.md",
    title: "Sensors",
  },
  "/hardware/esp32": {
    contentPath: "Hardware/ESP32.md",
    title: "ESP32",
  },
  "/hardware/lorawan": {
    contentPath: "Hardware/LoRaWAN.md",
    title: "LoRaWAN",
  },
  "/lang/de": { contentPath: "README.de.md", title: "Dokumentation (DE)" },
  "/lang/es": { contentPath: "README.es.md", title: "Documentación (ES)" },
  "/lang/fr": { contentPath: "README.fr.md", title: "Documentation (FR)" },
  "/lang/ja": { contentPath: "README.ja.md", title: "ドキュメント (JA)" },
  "/lang/uk": { contentPath: "README.uk.md", title: "Документація (UK)" },
  "/lang/zh-CN": {
    contentPath: "README.zh-CN.md",
    title: "文档 (zh-CN)",
  },
  "/de": { contentPath: "de/README.md", title: "Deutsch (Kurzfassung)" },
};
