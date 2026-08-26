import type { Locale } from "../i18n/types.ts";

export type SubscriptionKind = "news" | "beta";

/** Stable client-side key for the locale-specific server-side Listmonk list. */
export function subscriptionListKey(kind: SubscriptionKind, locale: Locale): string {
	return `${kind}-${locale}`;
}
