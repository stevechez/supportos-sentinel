// Phase 10E: the health baseline concept.
//
// "Baseline created: 71. Future improvements measured against this
// score." A baseline is not a new concept in the schema -- it's just the
// org's first-ever sentinel_reports row. Nothing before Phase 10 ever
// created that first row live (every existing report came from seed
// data); this file adds the one deterministic action that does.

import type { createClient } from '@supportos/auth/server';

import type { DashboardMetrics } from './analysis';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class BaselineError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'BaselineError';
		if (cause !== undefined) {
			this.cause = cause;
		}
	}
}

/**
 * Inserts the org's first sentinel_reports row from its current,
 * already-computed metrics -- no new calculation happens here, the
 * health score and summary are exactly what the dashboard is already
 * showing at the moment the customer clicks "Establish Baseline". Trend
 * Detection (Phase 5) and the Executive Timeline (Phase 7E) automatically
 * treat this as report #1 the moment it exists; nothing else needs to
 * change to make future reports compare against it.
 */
export async function createBaselineReport(
	supabase: SupabaseClient,
	organizationId: string,
	metrics: DashboardMetrics,
): Promise<void> {
	const { error } = await supabase.from('sentinel_reports').insert({
		organization_id: organizationId,
		title: 'Baseline Health Report',
		executive_summary: metrics.executiveSummary.summary,
		health_score: metrics.healthScore.score,
		report_period_start: new Date().toISOString(),
		report_period_end: new Date().toISOString(),
	});

	if (error) {
		throw new BaselineError('Could not establish a baseline. Please try again.', error);
	}
}
