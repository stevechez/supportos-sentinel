import type { createClient } from '@supportos/auth/server';

import type { SignalSource } from './sources';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Phase 10A: the provider-agnostic "Data Source Connection" concept. A
 * connection is just "this org turned this provider on" -- deliberately
 * not ZendeskConnection / SupportOsConnection, one table (sentinel_
 * connections) for every provider, keyed by the same SignalSource
 * vocabulary Phase 9A already established for sentinel_signals.source.
 */
export type ConnectionStatus = 'connected' | 'disconnected';

export interface DataSourceConnection {
	id: string;
	provider: SignalSource;
	status: ConnectionStatus;
	lastSyncAt: string | null;
	createdAt: string;
}

function toConnection(row: {
	id: string;
	provider: string;
	status: string;
	last_sync_at: string | null;
	created_at: string;
}): DataSourceConnection {
	return {
		id: row.id,
		provider: row.provider as SignalSource,
		status: row.status as ConnectionStatus,
		lastSyncAt: row.last_sync_at,
		createdAt: row.created_at,
	};
}

/** Every connection row for this org, keyed by provider for easy lookup. */
export async function getConnections(
	supabase: SupabaseClient,
	organizationId: string,
): Promise<Map<SignalSource, DataSourceConnection>> {
	const { data, error } = await supabase
		.from('sentinel_connections')
		.select('*')
		.eq('organization_id', organizationId);

	if (error) {
		console.error('[connections] fetching connections:', error);
		return new Map();
	}

	const byProvider = new Map<SignalSource, DataSourceConnection>();
	for (const row of data ?? []) {
		byProvider.set(row.provider as SignalSource, toConnection(row));
	}
	return byProvider;
}

/**
 * Marks a provider connected and stamps last_sync_at, creating the
 * connection row on its first use. Idempotent -- "Connect SupportOS" and
 * every later "Sync Now" both call this, so the row always reflects the
 * most recent sync regardless of which button triggered it.
 */
export async function upsertConnectionSynced(
	supabase: SupabaseClient,
	organizationId: string,
	provider: SignalSource,
): Promise<void> {
	const { error } = await supabase.from('sentinel_connections').upsert(
		{
			organization_id: organizationId,
			provider,
			status: 'connected',
			last_sync_at: new Date().toISOString(),
		},
		{ onConflict: 'organization_id,provider' },
	);

	if (error) {
		console.error('[connections] upserting connection:', error);
	}
}
