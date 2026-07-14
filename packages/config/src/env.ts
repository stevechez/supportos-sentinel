// Public environment variables — safe to read from Client Components as
// well as the server. Next.js inlines `process.env.NEXT_PUBLIC_*`
// references at build time, so these must stay as literal expressions
// (not dynamic lookups like `process.env[key]`) for the substitution to
// work correctly wherever this module ends up in the client bundle.
//
// Mirrors the exact fallback/assertion behavior of the code this
// replaces — no new validation was added, so error behavior for missing
// vars is unchanged.
export const env = {
	appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
	supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
	supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};
