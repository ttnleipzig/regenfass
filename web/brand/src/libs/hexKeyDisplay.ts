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

/** Mask one canonical pair (1–2 hex chars) as bullets for column cells. */
export function maskHexPairForDisplay(pair: string): string {
	return pair.replace(/[0-9A-Fa-f]/g, "\u2022");
}

const HEX_ALPHABET = "0123456789ABCDEF";

/** Uniform random hex string of `length` (for reveal “slot” animation only). */
export function randomHexString(length: number): string {
	if (length <= 0) return "";
	let s = "";
	for (let i = 0; i < length; i++) {
		s += HEX_ALPHABET[Math.floor(Math.random() * 16)]!;
	}
	return s;
}

/** Random formatted preview matching a canonical key of `canonicalLength` digits. */
export function randomFormattedAppKeyPreview(canonicalLength: number): string {
	return formatAppKeyHexPairs(randomHexString(canonicalLength));
}

/** Groups for slot reels: `["AB","CD",…]`; last entry may be one hex char if length is odd. */
export function splitCanonicalHexPairs(canonical: string): string[] {
	if (!canonical) return [];
	return canonical.match(/.{1,2}/g) ?? [];
}

/** Build scrolling strip rows ending in `target` (length 1 or 2). */
export function buildSlotReelRows(target: string, reelIndex: number): string[] {
	const len = Math.min(Math.max(target.length, 1), 2);
	const rowCount = 16 + reelIndex * 2 + Math.floor(Math.random() * 7);
	const rows: string[] = [];
	for (let i = 0; i < rowCount; i++) {
		rows.push(randomHexString(len));
	}
	rows.push(target);
	return rows;
}
