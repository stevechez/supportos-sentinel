# Troubleshooting Guide (Phase 18F)

Internal reference for handling pilot customer issues -- what's actually
true about each failure mode in the current codebase, not a guess.

## Connection failures

**What the customer sees:** the Connected Sources card shows the connection
as needing attention. Nothing else on the dashboard is affected.

**What's actually happening:** `syncSupportOsSignalsAction` failed --
usually a transient Supabase/network issue, since the SupportOS connector
reads directly from the same database, not an external API with its own
uptime. There's no retry queue; the customer needs to click Sync Now again.

**What to tell the customer:** "Nothing was lost -- click Sync Now again.
Everything Sentinel already found from previous syncs is still there and
unaffected."

## Missing data / zero-result sync

**What the customer sees:** they click Connect or Sync Now, and the
onboarding banner or Connected Sources card looks the same as before --
this is a real gap identified in `pilot-experience-audit.md`, not
distinguished from a genuine failure in the UI yet.

**What's actually happening:** `syncSupportOsSignalsAction` succeeded but
found zero new signals -- either there's genuinely no new ticket/conversation
data since the last sync, or the underlying `tickets`/`messages` tables are
empty for that organization.

**What to tell the customer:** ask whether they have tickets in their
connected system from the last few weeks. If yes and still zero signals,
that's a real bug -- escalate. If no, that's expected: Sentinel needs a few
weeks of real ticket volume before patterns are meaningful (see the ICP's
team-size assumption in `ideal-customer-profile.md`).

## AI unavailable

**What the customer sees:** an inline error where an AI explanation would be
("The rest of your dashboard is unaffected -- this only affects the AI
brief"), never a blank or broken page.

**What's actually happening:** the Anthropic API call in
`src/lib/ai/analyst.ts` failed or timed out. Every deterministic part of the
product (health score, findings, priorities, trends, emerging risks) is
completely unaffected, by design -- Phase 6's cost-control and boundary work
means AI is never in the critical path for anything Sentinel calculates,
only for explaining it in plain language afterward.

**What to tell the customer:** "Everything else is working normally -- try
generating the brief again in a moment."

## Sync issues generally

**Escalation path:** check Supabase logs for the organization's
`sentinel_connections` row and recent `activity_log` entries
(`synced_signals` actions) to see the actual error, rather than guessing
from the customer's description alone.

## General principle for any error state

Every error boundary in this app (`(dashboard)/error.tsx`, `global-error.tsx`)
follows the same three-line pattern: **something went wrong, your data is
safe, try again.** If a pilot customer describes something that doesn't
follow that pattern (a page that looks broken with no message, or a message
that doesn't reassure them their data is intact), that's a bug in the error
handling itself, not just the underlying failure -- treat it as higher
priority than the original issue.
