import type { Locale } from "../i18n/types.ts";

export function homepageLink(locale: Locale, path: "privacy" | "imprint") {
  const suffix = `/${locale}/${path}`;
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) {
    return `http://localhost:5175${suffix}`;
  }
  return `https://regenfass.eu${suffix}`;
}
