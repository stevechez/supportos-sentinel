'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Radar } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { syncSupportOsSignalsAction } from '@/lib/signals/actions';

// Phase 10C: "the first dashboard should not be empty." Shown only for a
// genuinely brand-new organization (zero signals, zero reports ever) in
// place of the normal KPI-heavy layout -- a calm, single next step rather
// than a wall of zeroes. Connecting *is* syncing (Phase 10A) -- one click
// takes the org from nothing to "see signals."
export function OnboardingBanner() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleConnect() {
		setError(null);
		startTransition(async () => {
			const result = await syncSupportOsSignalsAction();
			if (result.ok) {
				router.refresh();
			} else {
				setError(result.error);
			}
		});
	}

	return (
		<div className="rounded-xl border bg-card p-8 text-center shadow-sm">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
				<Radar className="h-5 w-5 text-primary" aria-hidden="true" />
			</div>

			<h1 className="mt-4 font-heading text-2xl text-foreground">Sentinel is learning your operation.</h1>

			<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
				Connect your support data to discover recurring issues, knowledge gaps, and improvement
				opportunities.
			</p>

			<div className="mt-6 flex justify-center">
				<Button onClick={handleConnect} disabled={isPending}>
					{isPending ? 'Connecting…' : 'Connect SupportOS'}
				</Button>
			</div>

			{/* Phase 19B -- the founder walkthrough (docs/product/founder-pilot-walkthrough.md)
				found that a first-time user has no way to know "SupportOS" means their
				existing ticketing tool until someone explains it out loud. This line
				says it in the UI instead. */}
			<p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground">
				SupportOS is the ticketing connection -- for most teams, that&apos;s your existing
				Zendesk, Intercom, or Freshdesk data.
			</p>

			{error && <p className="mt-3 text-sm text-destructive">{error}</p>}
		</div>
	);
}
