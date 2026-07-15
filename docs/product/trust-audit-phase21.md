# Trust and AI Transparency Re-Audit (Phase 21H)

Re-verification triggered by Phase 21 making customer conversations more
visibly part of the product surface (Conversations, Support Inbox,
finding provenance). The underlying `tickets`/`messages` data was already
being read by Sentinel's signal pipeline since Phase 9-11; what changed in
this phase is that a person can now see that data directly, not that new
data access was introduced. This audit checks whether that added
visibility broke anything the product has promised since the Trust Center
was written (Phase 17F) and reaffirmed in every subsequent phase's audit
(most recently Phase 18G, Phase 20).

## What was checked

### 1. AI still only explains, never decides

Every new surface built in Phase 21 (Conversations, Support Inbox,
Executive Operations summary, finding provenance, the rewritten
Intelligence page) is **deterministic reads only** -- plain Postgres
queries and pure functions (`conversation-list.ts`, `support-inbox.ts`,
`provenance.ts`). None of them call the AI layer (`packages/ai`), none of
them write to any table, and none of them make a decision on the user's
behalf. The one place AI still appears (the AI Executive Brief on
Overview) is unchanged from Phase 6/8E/12F -- it explains already-computed
findings, it doesn't produce them.

The rewritten `/dashboard/intelligence` page now states this boundary
directly ("Rules detect. AI explains. You decide.") instead of implying a
live, autonomous assistant -- correcting the Phase 21A audit's most
significant finding (three hardcoded "Active" cards describing capability
that didn't exist).

### 2. No auto-modification of customer data

Checked every new function added this phase for writes: `getRecentConversations`,
`getSupportInboxOverview`, `getFindingProvenance` are all read-only
(`select` only, no `insert`/`update`/`delete`). Nothing in this phase adds
a write path to `tickets`, `messages`, or `customers`. The only existing
write paths into that data remain what they were before this phase: the
SupportOS sync job (`sync.ts`, ingests signals only, never mutates
tickets/messages) and whatever produces the seed/demo data. Sentinel still
has no code path that edits a customer's ticket or message content.

### 3. Organization isolation

Every new query added this phase filters by `organization_id` from
`getCurrentMembership()` (never client-supplied) -- verified directly in
`conversation-list.ts`, `support-inbox.ts`, and `provenance.ts`. All three
underlying tables (`tickets`, `messages`, `customers`) have RLS enabled at
the database level (confirmed via `list_tables`), consistent with every
other table in this schema since Phase 1's RLS foundation. Phase 18's
cross-tenant RPC vulnerability (three SECURITY DEFINER functions bypassing
RLS) was already fixed by REVOKE and remains revoked; this phase didn't
touch RPCs or RLS policies at all.

### 4. Conversation visibility

New: a person can now see `messages.body`... actually, they can't --
Conversations and Support Inbox deliberately surface only ticket
`subject`, `status`, message *counts*, and derived outcome (handled /
escalated / unresolved), never raw message `body` text. This was a
deliberate scope decision, not an oversight: the Phase 21 handoff scopes
this workstream to "recent/AI-handled/escalated/unresolved," not a full
transcript viewer. If a future phase adds transcript viewing, it should
get its own privacy/access review at that time -- reading a customer's
verbatim conversation is a materially different exposure than reading
ticket metadata, and deserves its own explicit decision rather than
inheriting this one.

### 5. AI disclosure surfaces

`/dashboard/intelligence` (rewritten this phase) and `/trust` (Phase 17F,
unchanged) both still state the same three principles: AI assists and
explains, humans decide, data stays the customer's. No new AI disclosure
language was needed because no new AI capability was added -- only
existing deterministic data got a new, more honest presentation.

## Findings

No violations found. One gap closed (the misleading `/dashboard/intelligence`
page, addressed directly in Phase 21B rather than just documented). One
scope boundary flagged for future phases: raw message transcript content
is intentionally not surfaced yet, and any future work that does surface
it should treat that as a new decision, not an extension of this phase's
work.

## What would trigger a fuller review

- Any future workstream that surfaces raw `messages.body` content to
  users (a transcript viewer).
- Any future workstream that gives AI a write path into `tickets` or
  `messages` (auto-resolution, auto-tagging, auto-replies) -- explicitly
  out of scope for Phase 21 and flagged here as a boundary that should not
  be crossed without its own dedicated trust review.
- Any change to RLS policies or SECURITY DEFINER functions touching
  `tickets`, `messages`, or `customers`.
