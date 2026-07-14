# Analytics Foundation (Phase 17H)

Per the Phase 17 handoff: "Do not build a full analytics platform. Only
measure the funnel." No analytics vendor was added. The funnel is measured
using the `activity_log` table that already exists (Phase 16A).

## The funnel

| Step | Activity action | Logged where |
|---|---|---|
| Signup | `signed_up` | `packages/auth/actions/auth.ts`, `ensureWorkspace()` — once, when a workspace is first created |
| Connection completed | `synced_signals` | `src/lib/signals/actions.ts`, `syncSupportOsSignalsAction()` — every successful sync, including the first |
| First insight / activation | `created_baseline_report` | `src/lib/dashboard/actions.ts`, `createBaselineReportAction()` — the first health report is the point a "first insight" becomes a durable result |

Return visits are not separately tracked — `activity_log.created_at` on any
row already shows when an organization was last active, which is enough to
answer "did they come back" without a new tracking surface.

## How to read the funnel today

Each step above is a row in `activity_log` scoped to `organization_id`. To
see the funnel for all organizations:

```sql
select action, count(*) as occurrences, count(distinct organization_id) as organizations
from activity_log
where action in ('signed_up', 'synced_signals', 'created_baseline_report')
group by action;
```

Drop-off between `signed_up` and `synced_signals` for a given organization
is exactly the gap the `OnboardingBanner` (Phase 10C) is designed to close.

## What was deliberately not built

- No analytics vendor (PostHog, GA, Segment, etc.) — none existed before
  Phase 17 and none was added.
- No pageview or pre-auth visitor tracking — a visitor who never signs up
  never creates an `activity_log` row, and that's fine: the funnel starts
  where the product does.
- No dashboard/report UI for this data yet — it's queryable, not yet
  visualized. Worth doing once there's more than a handful of organizations
  to look at.
