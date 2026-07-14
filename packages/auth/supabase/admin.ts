import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { env } from '@supportos/config/env';
import { serverEnv } from '@supportos/config/env/server';
import type { Database } from '@supportos/database/types';

/**
 * Service-role Supabase client that bypasses Row Level Security. Only use
 * this from trusted server contexts with no user session to attach to —
 * webhooks, cron jobs, admin tooling. Never import from a Client Component
 * or expose the service role key to the browser.
 */
export function createAdminClient() {
	return createSupabaseClient<Database>(
		env.supabaseUrl,
		serverEnv.supabaseServiceRoleKey,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);
}
