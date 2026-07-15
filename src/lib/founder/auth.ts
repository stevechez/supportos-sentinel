import { createClient } from '@supportos/auth/server';
import { serverEnv } from '@supportos/config/env/server';

/**
 * Phase 19C -- is the current session the founder running pilots? Not a
 * new role in the member_role hierarchy (that hierarchy is org-scoped by
 * design; this check deliberately isn't) -- a plain email allowlist read
 * from FOUNDER_EMAILS. Returns false, not an error, when unset -- the
 * founder dashboard route treats "not a founder" and "not configured" the
 * same way (redirect away), so there's no error message that leaks
 * whether the feature exists to a curious pilot customer.
 */
export async function isFounder(): Promise<boolean> {
	if (serverEnv.founderEmails.length === 0) {
		return false;
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user?.email) {
		return false;
	}

	return serverEnv.founderEmails.includes(user.email.toLowerCase());
}
