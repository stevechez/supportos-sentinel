// Shared deterministic word-overlap similarity (originally Phase 12C,
// src/lib/dashboard/memory.ts). Extracted here in Phase 14 so the trend
// engine (src/lib/signals/trends.ts) can cluster differently-worded
// signals into the same operational theme ("password reset confusion" /
// "customer forgot password" / "password reset link expired") without
// duplicating this logic. Still no embeddings, no vector database --
// Jaccard over stopword-filtered, punctuation-normalized words is the
// whole algorithm, per every phase's explicit scope.

const STOPWORDS = new Set([
	'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'my', 'your', 'our', 'their',
	'this', 'that', 'these', 'those', 'to', 'for', 'of', 'on', 'in', 'with', 'and', 'or', 'not',
	'no', 'do', 'does', 'did', 'can', 'cant', "can't", 'i', 'it', 'me', 'we', 'you', 'us',
	'about', 'from', 'again',
]);

export function significantWords(title: string): Set<string> {
	const words = title
		.toLowerCase()
		// Strip apostrophes first (not replace with space) so "can't" becomes
		// "cant" -- a real stopword -- instead of splitting into stray "can"
		// and "t" tokens.
		.replace(/['’]/g, '')
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.split(/\s+/)
		.filter(word => word.length > 0 && !STOPWORDS.has(word));
	return new Set(words);
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 || b.size === 0) {
		return 0;
	}
	let intersection = 0;
	for (const word of a) {
		if (b.has(word)) {
			intersection += 1;
		}
	}
	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

/** Below this overlap, two titles are treated as unrelated rather than "the same theme." Shared threshold for both memory matching (12C) and trend clustering (14A). */
export const MIN_SIMILARITY = 0.3;
