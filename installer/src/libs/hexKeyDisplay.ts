/** Strip non-hex, keep at most 32 characters (LoRaWAN AppKey). Preserves letter casing. */
export function normalizeAppKeyHexInput(raw: string): string {
	const digits = raw.match(/[0-9A-Fa-f]/g)?.join("") ?? "";
	return digits.slice(0, 32);
}

/** Insert a space after every two hex characters for display (partial keys supported). */
export function formatAppKeyHexPairs(canonical: string): string {
	const pairs = canonical.match(/.{1,2}/g);
	return pairs?.join(" ") ?? "";
}

/** Replace hex digits with bullet dots; keeps spaces between pairs (masked preview). */
export function maskAppKeyFormattedForDisplay(formattedWithSpaces: string): string {
	return formattedWithSpaces.replace(/[0-9A-Fa-f]/g, "\u2022");
}
