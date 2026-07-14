import type { FindingRow, RecommendationRow, ReportRow } from './analysis';
import { calculateImprovement } from './improvement';
import { jaccardSimilarity, MIN_SIMILARITY, significantWords } from '../text-similarity';

// ---------------------------------------------------------------------------
// Phase 12 -- organizational memory.
//
//   New issue detected -> Sentinel searches history -> previous patterns
//   discovered -> previous actions reviewed -> AI explains what worked
//   before -> better recommendation
//
// Per the handoff's explicit database guidance: "memory" is a product
// concept, not a table. No sentinel_memory, no sentinel_history. An
// ImprovementEvent is a derived shape over sentinel_findings +
// sentinel_recommendations + sentinel_reports -- exactly the same rows
// Phase 7's improvement.ts already reads, just joined and reframed as
// historical evidence rather than a live status board. Similarity is
// deterministic word-overlap, not embeddings -- Phase 12C is explicit
// that vector search is a later phase.
// ---------------------------------------------------------------------------

/**
 * A completed operational change, joined from a resolved finding and the
 * completed recommendation that resolved it. Not a task tracker record --
 * every field here already existed before Phase 12; this is a read model,
 * not new state.
 */
export interface ImprovementEvent {
	findingId: string;
	problemTitle: string;
	recommendationId: string;
	actionTaken: string;
	beforeScore: number | null;
	afterScore: number;
	delta: number | null;
	/** A grounded, deterministic sentence -- never a fabricated metric like a ticket-volume percentage we don't actually measure. */
	impactSummary: string;
	completedAt: string;
}

function impactSummary(delta: number | null, measuredByReport: boolean): string {
	if (delta === null) {
		return 'Impact not yet measured.';
	}
	if (delta === 0) {
		return 'Health score held steady after this change.';
	}
	const direction = delta > 0 ? 'improved' : 'declined';
	const confidence = measuredByReport ? '' : ' (based on the current live score; not yet confirmed by a later report)';
	return `Health score ${direction} by ${Math.abs(delta)} point${Math.abs(delta) === 1 ? '' : 's'}${confidence}.`;
}

/**
 * Every resolved finding whose linked recommendation was completed,
 * reframed as historical evidence. Reuses Phase 7C's calculateImprovement
 * for the before/after score -- no new calculation, just a join and a
 * summary sentence.
 */
export function buildImprovementEvents(
	findings: FindingRow[],
	recommendations: RecommendationRow[],
	reports: ReportRow[],
	currentScore: number,
): ImprovementEvent[] {
	const resolvedFindings = new Map(
		findings.filter(f => f.status === 'resolved').map(f => [f.id, f] as const),
	);

	const events: ImprovementEvent[] = [];

	for (const recommendation of recommendations) {
		if (recommendation.status !== 'completed' || !recommendation.completed_at || !recommendation.finding_id) {
			continue;
		}

		const finding = resolvedFindings.get(recommendation.finding_id);
		if (!finding) {
			continue;
		}

		const record = calculateImprovement(recommendation, reports, currentScore);
		if (!record) {
			continue;
		}

		events.push({
			findingId: finding.id,
			problemTitle: finding.title,
			recommendationId: recommendation.id,
			actionTaken: recommendation.recommendation,
			beforeScore: record.healthScoreBefore,
			afterScore: record.healthScoreAfter,
			delta: record.delta,
			impactSummary: impactSummary(record.delta, record.measuredByReport),
			completedAt: recommendation.completed_at,
		});
	}

	return events.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

// ---------------------------------------------------------------------------
// Deterministic similarity (Phase 12C)
//
// "Password reset confusion" / "Password reset issues" / "Customers
// cannot reset password" should all match as the same operational theme.
// Word-overlap (Jaccard over significant words) is enough for that --
// no embeddings, no vector database, per the handoff's explicit scope.
// ---------------------------------------------------------------------------

export interface SimilarResolution {
	event: ImprovementEvent;
	score: number;
}

/**
 * Given a new issue's title (a candidate finding, or a detected signal
 * pattern's title) and the organization's improvement history, finds past
 * resolved issues that look like the same operational theme. Sorted by
 * similarity, most similar first -- callers typically only care about the
 * top match.
 */
export function findSimilarPastResolutions(
	candidateTitle: string,
	events: ImprovementEvent[],
): SimilarResolution[] {
	const candidateWords = significantWords(candidateTitle);

	return events
		.map(event => ({ event, score: jaccardSimilarity(candidateWords, significantWords(event.problemTitle)) }))
		.filter(match => match.score >= MIN_SIMILARITY)
		.sort((a, b) => b.score - a.score);
}
