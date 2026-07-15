# Pilot Customer Management Audit (Phase 22C)

The Phase 22 handoff asks the founder dashboard to track: organization,
pilot status, connected source, last activity, first insight, feedback
count, and customer health -- explicitly warning against building a
CRM or sales pipeline. This is an audit of `/dashboard/founder`
(`src/app/(dashboard)/dashboard/founder/page.tsx`,
`src/lib/founder/data.ts`) against that list, not a new system.

## Audit result

| Required field      | Present before this phase | Source |
|----------------------|---------------------------|--------|
| Organization          | Yes (Phase 19C)            | `organizations.name` |
| Pilot status           | Yes (Phase 20B)            | `organizations.pilot_status` |
| Connected source       | Yes (Phase 19C)            | `sentinel_connections.status` |
| Last activity          | Yes (Phase 20I)            | `activity_log`, most recent row per org |
| First insight          | Yes (Phase 20C)            | `sentinel_reports`, earliest `created_at` per org |
| Feedback count         | Yes (Phase 20D)            | `customer_feedback`, counted per org |
| **Customer health**    | **No -- gap found**        | -- |

Six of seven fields already existed, built incrementally across Phases
19-20 from tables that already existed for other reasons -- exactly the
"expand existing founder dashboard only if needed" instruction from this
handoff. The one gap is customer health.

## Fix made this phase

Added `latestHealthScore` to `FounderPilotRow`
(`src/lib/founder/data.ts`): the `health_score` from each organization's
most recent `sentinel_reports` row, using the same overwrite-on-ascending-
order accumulation pattern already used for other per-organization
extrema in this file (contrasted inline with `firstReportAt`'s keep-first
logic). No new computation -- this is the exact score the customer already
sees on their own Insights page (`health-score-card.tsx`'s bands), just
made scannable across every pilot organization at once.

Rendered as a `HealthBadge` column on `/dashboard/founder`: green (>=70),
amber (>=40), red (below), `--` when the organization has no report yet.

## Why nothing else changed

- **No CRM fields were added.** No deal stage, no owner assignment, no
  notes/activity-log-for-humans, no contact history beyond the primary
  contact name/email that already existed (Phase 20B). The table is still
  a read of existing data, not a system a founder edits sales state into.
- **No new tables.** All seven fields now come from five tables that exist
  for product reasons independent of pilot tracking (`organizations`,
  `sentinel_connections`, `sentinel_reports`, `activity_log`,
  `customer_feedback`).
- **`docs/product/pilot-dashboard.md`'s SQL-query approach is unchanged.**
  That doc predates the founder dashboard UI (Phase 19C) and documents the
  fallback if the UI approach ever needs to be bypassed; it isn't
  superseded, just less commonly needed now that the UI covers the same
  ground.
