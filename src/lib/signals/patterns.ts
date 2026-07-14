import type { OperationalSignal, SignalType } from './types';
import { SIGNAL_TYPE_LABELS } from './types';

// ---------------------------------------------------------------------------
// Deterministic pattern detection (Phase 8D/8E).
//
//   Signals -> deterministic grouping -> candidate patterns -> AI explanation
//
// Everything in this file is pure and rule-based, same discipline as
// src/lib/dashboard/analysis.ts. It groups signals, it does not decide
// anything on Sentinel's behalf -- a pattern only becomes a real finding
// when a human clicks "Create Finding" (src/lib/signals/actions.ts).
// ---------------------------------------------------------------------------

export interface SignalPattern {
	/** Stable key for this cluster, used to re-select it across a page reload. */
	key: string;
	type: SignalType;
	/** Representative title -- the most common title in the cluster. */
	title: string;
	signalIds: string[];
	recurrenceCount: number;
	daySpan: number;
	firstSeen: string;
	lastSeen: string;
}

/** Signals only cluster together as the same pattern once this many exist. Below this, it's noise, not a pattern. */
export const MIN_RECURRENCE = 3;

function normalizeTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Groups unlinked signals (findingId === null -- already-linked signals
 * already produced a finding and aren't candidates again) by type + exact
 * normalized title match. Deliberately simple and exact rather than fuzzy
 * similarity scoring: predictable, explainable, and enough to prove the
 * model with manually-entered signals, which is what Phase 8C scopes this
 * to. A recurrence count below MIN_RECURRENCE isn't surfaced as a pattern.
 */
export function detectSignalPatterns(signals: OperationalSignal[]): SignalPattern[] {
	const candidates = signals.filter(signal => !signal.findingId);
	const groups = new Map<string, OperationalSignal[]>();

	for (const signal of candidates) {
		const key = `${signal.type}::${normalizeTitle(signal.title)}`;
		const group = groups.get(key) ?? [];
		group.push(signal);
		groups.set(key, group);
	}

	const patterns: SignalPattern[] = [];

	for (const [key, group] of groups) {
		if (group.length < MIN_RECURRENCE) {
			continue;
		}
		patterns.push(buildPattern(key, group));
	}

	return patterns.sort((a, b) => b.recurrenceCount - a.recurrenceCount);
}

/**
 * Builds a SignalPattern from an already-grouped set of signals. Exported
 * so a server action can recompute the same deterministic stats for a
 * specific set of signal ids server-side (never trusting client-sent
 * numbers) when creating a finding from a pattern (Phase 8D).
 */
export function buildPattern(key: string, group: OperationalSignal[]): SignalPattern {
	const sorted = [...group].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
	const firstSeen = sorted[0].createdAt;
	const lastSeen = sorted[sorted.length - 1].createdAt;
	const daySpan = Math.max(
		1,
		Math.round((new Date(lastSeen).getTime() - new Date(firstSeen).getTime()) / 86_400_000),
	);

	return {
		key,
		type: group[0].type,
		title: group[0].title,
		signalIds: group.map(signal => signal.id),
		recurrenceCount: group.length,
		daySpan,
		firstSeen,
		lastSeen,
	};
}

// ---------------------------------------------------------------------------
// Deterministic derivation for "Create Finding from this pattern" (8D).
//
// The analysis engine still owns the decision of what a finding says --
// title/category/severity/confidence are all computed from the pattern's
// own numbers, never from AI output. The AI (8E) only ever explains a
// pattern; it never writes into sentinel_findings.
// ---------------------------------------------------------------------------

const TYPE_TO_FINDING_CATEGORY: Record<SignalType, string> = {
	ticket: 'technical',
	conversation: 'customer_sentiment',
	knowledge_gap: 'knowledge_gap',
	customer_feedback: 'customer_sentiment',
	metric: 'technical',
};

export interface DerivedFinding {
	title: string;
	category: string;
	severity: 'critical' | 'high' | 'medium';
	description: string;
	businessImpact: string;
	confidenceScore: number;
}

export function deriveFindingFromPattern(pattern: SignalPattern): DerivedFinding {
	const severity: DerivedFinding['severity'] =
		pattern.recurrenceCount >= 10 ? 'critical' : pattern.recurrenceCount >= 5 ? 'high' : 'medium';

	// Confidence rises with recurrence, capped at 95 -- deliberately never
	// 100, since this is still derived from a handful of manually-logged
	// signals, not a statistically large sample.
	const confidenceScore = Math.min(95, 50 + pattern.recurrenceCount * 5);

	const typeLabel = SIGNAL_TYPE_LABELS[pattern.type].toLowerCase();

	return {
		title: pattern.title,
		category: TYPE_TO_FINDING_CATEGORY[pattern.type],
		severity,
		description: `${pattern.recurrenceCount} ${typeLabel} signals reported "${pattern.title}" over ${pattern.daySpan} day${pattern.daySpan === 1 ? '' : 's'}.`,
		businessImpact: `Recurring pattern across ${pattern.recurrenceCount} operational signals suggests this is an active, ongoing issue rather than an isolated report.`,
		confidenceScore,
	};
}
