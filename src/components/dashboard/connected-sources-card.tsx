'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RefreshCw, Waves } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { syncSupportOsSignalsAction } from '@/lib/signals/actions';
import type { ConnectedSourceStatus } from '@/lib/signals/data';

interface ConnectedSourcesCardProps {
	sources: ConnectedSourceStatus[];
}

// Phase 9D: "the user should understand Sentinel is watching." A status
// summary, not a settings page -- there is exactly one action here (sync
// SupportOS now), no OAuth flow, no per-source configuration.
export function ConnectedSourcesCard({ sources }: ConnectedSourcesCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<Waves className="h-5 w-5 text-primary" aria-hidden="true" />
				<div>
					<h2 className="font-heading text-lg text-foreground">Connected Sources</h2>
					<p className="text-sm text-muted-foreground">Where Sentinel&apos;s signals are coming from</p>
				</div>
			</div>

			<div className="divide-y">
				{sources.map(source => (
					<SourceRow key={source.source} source={source} />
				))}
			</div>
		</div>
	);
}

function SourceRow({ source }: { source: ConnectedSourceStatus }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [lastResult, setLastResult] = useState<string | null>(null);

	function handleSync() {
		setError(null);
		setLastResult(null);
		startTransition(async () => {
			const result = await syncSupportOsSignalsAction();
			if (result.ok) {
				setLastResult(
					result.newSignalCount === 0
						? 'Up to date -- no new signals.'
						: `Synced ${result.newSignalCount} new signal${result.newSignalCount === 1 ? '' : 's'}.`,
				);
				router.refresh();
			} else {
				setError(result.error);
			}
		});
	}

	return (
		<div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
				<div>
					<h3 className="text-sm font-medium text-foreground">{source.label}</h3>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{source.signalCount} signal{source.signalCount === 1 ? '' : 's'} received
						{source.lastSyncedAt && <> · Last sync {relativeTime(source.lastSyncedAt)}</>}
						{!source.lastSyncedAt && <> · Not synced yet</>}
					</p>
					{error && <p className="mt-1 text-xs text-destructive">{error}</p>}
					{lastResult && !error && (
						<p className="mt-1 text-xs text-muted-foreground">{lastResult}</p>
					)}
				</div>
			</div>

			{source.source === 'supportos' && (
				<Button size="xs" variant="outline" onClick={handleSync} disabled={isPending}>
					<RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
					{isPending ? 'Syncing…' : 'Sync Now'}
				</Button>
			)}
		</div>
	);
}

function relativeTime(iso: string): string {
	const diffMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.round(diffMs / 60_000);
	if (minutes < 1) {
		return 'just now';
	}
	if (minutes < 60) {
		return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	}
	const hours = Math.round(minutes / 60);
	if (hours < 24) {
		return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	}
	const days = Math.round(hours / 24);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}
