# Pilot Safety Controls Audit (Phase 18G)

Audited before giving any real pilot customer access. One real finding, fixed
in this phase; everything else verified as already correct.

## Data isolation

**Organization boundaries / RLS:** verified directly against the live
schema. `organizations`, `members`, `activity_log`, `knowledge_documents`,
`knowledge_chunks`, and every `sentinel_*` table all scope `select` to
`organization_id in (select user_org_ids())`, and every `insert`/`update`/
`delete` policy requires `user_has_role()` at an appropriate level. This is
consistent with every prior phase's audit (Phase 1, 15, 16) -- no
regressions found.

**Member access:** `user_has_role(p_org, p_min)` is the actual authorization
boundary (not just a UI-level check) -- confirmed the four-level
`member_role` hierarchy (owner/admin/agent/viewer) is enforced at the RLS
layer for every table, including the new `customer_feedback` table added in
this phase (viewer can submit, admin can triage).

**Real finding -- fixed:** three `SECURITY DEFINER` RPC functions
(`list_customer_visible_documents`, `match_knowledge_chunks_for_org`,
`match_knowledge_chunks_public`) accept an arbitrary `p_org_id` parameter and
were callable by `anon`/`authenticated` roles via the public PostgREST RPC
endpoint. Because `SECURITY DEFINER` functions run with the *function
owner's* privileges, they bypass the RLS policies on the tables they query
entirely -- any signed-in user (or, for two of the three, anyone
unauthenticated at all) could have called these with a different
organization's id and read that organization's private knowledge base
content directly, no membership required.

This is part of the unused "chat agent" schema (confirmed via the Phase 15
audit: zero application code in this repo calls these functions). It was
still live and exploitable against the real Supabase project regardless of
whether Sentinel's own UI used it -- anyone with the public anon key (which
is, by design, exposed in any client-side app) could call it directly.

Fixed via migration `20260714120000_revoke_unused_knowledge_rpc_execute.sql`
-- revoked `EXECUTE` from `anon` and `authenticated` on all three functions.
No table, RLS policy, or application code path was touched. If knowledge
search is wired up for real in a future phase, `EXECUTE` should be
re-granted alongside a caller-identity check inside the function body (e.g.
requiring the caller to actually be a member of `p_org_id`), not just
reopened as it was.

**Other advisories reviewed, not changed:** `jobs` and `rate_limits` have
RLS enabled with no policies -- this means *no* access at all for
anon/authenticated (the safe default when a table has nothing to say about
who should read it), not a gap. The `vector` and `pg_net` extensions living
in the `public` schema is a Supabase linter hygiene suggestion, not a
customer-facing risk, and moving extensions on a live database is disruptive
enough that it's out of scope for "smallest changes necessary" this phase.
Leaked-password-protection being disabled is a Supabase Auth *dashboard*
setting, not something fixable via code -- flagged here as a one-click
recommendation for whoever manages the Supabase project settings before
onboarding real pilot customers.

## AI behavior

Re-verified the boundary that's been held since Phase 6 and extended
through every AI feature since (Phase 8E, 10F, 12F, 14E/F):

- ✅ **AI explains insights.** Every `generate*` function in
  `src/lib/ai/analyst.ts` takes an already-computed `*Insight` object built
  by a pure, deterministic `build*Insight` function -- never raw database
  rows.
- ❌ **Does not invent findings.** Findings, health scores, priorities, and
  trends are all calculated in `src/lib/dashboard/analysis.ts` and
  `src/lib/signals/*` before AI is ever called. No AI call in this codebase
  writes to `sentinel_findings`, `sentinel_recommendations`, or any table
  that drives the dashboard's numbers.
- ❌ **Does not make decisions.** Every AI output in this app is opt-in
  (a button the user clicks) and display-only -- nothing an AI call returns
  is ever used to change a finding's status, a recommendation's status, or
  any other stateful record. Status changes require an explicit user action
  (`updateFindingStatusAction`, `updateRecommendationStatusAction`).
- ❌ **Does not expose other customers' data.** Every `build*Insight`
  function only ever receives data already scoped to the current
  organization by the caller (which itself went through RLS). No cross-org
  data has ever been passed into a prompt in this codebase.

No changes needed here -- the boundary was already sound.

## Error handling

Verified the customer sees the same three-part message anywhere a page
fails to load:

```
Something went wrong.
Your data is safe.
Try again.
```

`(dashboard)/error.tsx` and `global-error.tsx` both already carry this
(Phase 16E). `(marketing)/error.tsx` intentionally does not carry the "your
data is safe" line -- there's no customer data at risk pre-login, so adding
it there would be a false reassurance about something that was never at
risk, not a genuine improvement. Left as-is.

## Verdict

Safe to give to a real pilot customer, with one fix already applied
(the knowledge RPC exposure) and one platform-level recommendation
(enable leaked-password protection in Supabase Auth settings) still open,
outside code's ability to fix.
