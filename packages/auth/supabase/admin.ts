import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@supportos/database/types';

/**
 * Service-role Supabase client that bypasses Row Level Security. Only use
 * this from trusted server contexts with no user session to attach to —
 * webhooks, cron jobs, admin tooling. Never import from a Client Component
 * or expose the service role key to the browser.
 */
export function createAdminClient() {
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!serviceRoleKey) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
	}

	return createSupabaseClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		serviceRoleKey,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);
}
