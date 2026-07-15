# Platform Audit (Phase 21A)

Required reading before this phase's UI work. Audits the repository as it
stood before this phase touched it, against the handoff's exact checklist:
existing SupportOS pieces, existing Chat Agent pieces, existing Sentinel
pieces. A companion, earlier-session document
(`docs/architecture/unified-customer-operations.md`) covers the same
ground from a slightly different angle -- both agree on the central
finding below and are kept for their different framings, but this file is
the current source of truth for Phase 21/v2's specific checklist.

## Central finding

SupportOS, Chat Agent, and Sentinel are not three codebases. They are one
Next.js application reading one Postgres database. There is no service
boundary, no API between them, and (before this phase) no dedicated UI for
two of the three data types they all share.

## Existing SupportOS pieces

**Ticket UI:** none, before this phase. `tickets` (10 rows in the live
project: `id, organization_id, customer_id, assignee_id, subject, status,
priority, tags, sentiment, intent, ai_resolved, channel, decision_path,
decision_confidence, decision_reason, first_response_at, resolved_at,
created_at, ...`) is real, populated, RLS-protected data that only ever
appeared in the product already transformed into Sentinel signals -- a
user never saw a raw ticket list.

**Conversation UI:** none, before this phase. `messages` (16 rows:
`id, organization_id, ticket_id, sender (customer/agent/ai/system), member_id,
body, sentiment, is_internal, created_at`) is the message thread behind
each ticket. `src/lib/signals/sync.ts` and
`src/lib/signals/adapters/conversations.ts` (Phase 11) already read this
table to derive signals (escalation detection: an `ai` message followed by
an `agent` message), but nothing rendered a message thread for a human to
read.

**Message UI:** same as above -- no per-message view existed anywhere.

**Customer UI:** none. `customers` (2 rows: `id, organization_id, email,
name, phone, avatar_url, company, lifetime_value, tags, notes, ai_summary,
created_at`) had **zero references** anywhere in `src/` or `packages/` --
confirmed by grep. Real, populated, RLS-protected, and completely
invisible in the product.

## Existing Chat Agent pieces

**Widgets:** none. No customer-facing chat widget exists in the codebase.

**API routes:** none. No route under `src/app/api` accepts or answers a
chat message.

**Chat components:** none. `src/app/(marketing)/products/chatbot/page.tsx`
is marketing copy describing a chatbot as a product concept -- it renders
no actual chat interface and calls no backend.

**AI integration:** `src/lib/ai/` (`analyst.ts`, `prompts.ts`, `types.ts`,
`actions.ts`) is the one real AI integration in the codebase -- a single
shared `callAnthropicForJson()` helper (Anthropic Messages API, cost
capped at 500 output tokens, 20s timeout, hard-typed request/response
contracts) used by six `generate*` functions. Every one of them, before
this phase, existed to *explain* an already-computed Sentinel conclusion
(executive brief, improvement explanation, signal pattern explanation,
welcome brief, historical advice, emerging risk explanation) -- none of
them generated an original answer to a question. There was no "Chat
Agent" AI integration distinct from Sentinel's analysis AI.

Also confirmed dead: six tables that look chat-agent-adjacent
(`agent_configs`, `automations`, `business_rules`, `action_requests`,
`knowledge_documents`, `knowledge_chunks`) have rows but zero application
code referencing them anywhere -- vestigial schema from an earlier,
unbuilt plan, not a working feature (see Phase 18's security audit, which
revoked public EXECUTE on three unused RPCs over the knowledge tables as
a precaution).

`apps/platform/` and `apps/marketing/` at the repo root contain only a
`.gitkeep` file each -- empty placeholders, not a second application.

## Existing Sentinel pieces

**Dashboard:** `/dashboard` -- the main landing page, built across
Phases 4-14: health score, trend, emerging risks, critical findings,
recommended actions, operational memory, KPI cards, executive summary, AI
executive brief, recent improvements, timeline, customer conversations
summary, operational signals, connected sources.

**Intelligence:** `/dashboard/intelligence` -- before this phase, a fully
static page with three hardcoded "Active"/"Ready" cards describing an AI
assistant capability that didn't exist. The single most misleading
surface in the product (flagged and rewritten in an earlier session's
Phase 21B work to state the real AI boundary plainly instead).

**Reports:** `/reports` -- lists `sentinel_reports`, the periodic health
snapshots the scoring engine produces.

**Recommendations:** `/recommendations` -- lists `sentinel_recommendations`,
each linked to the finding that produced it.

Also present: `/findings` (`sentinel_findings`) and
`/dashboard/knowledge-gaps` (`sentinel_knowledge_gaps`), both fed by the
same deterministic pipeline: `tickets`/`messages` -> `sync.ts` -> adapters
-> `sentinel_signals` -> pattern detection -> `sentinel_findings` ->
`sentinel_recommendations`. AI (`src/lib/ai/analyst.ts`) is used only to
explain conclusions this pipeline already reached -- "code calculates, AI
explains" -- unbroken since Phase 6.

## What this phase adds

Per this audit, the two real gaps were: no ticket/conversation/customer
UI, and no working AI Assistant capability of any kind. This phase closes
both directly, over the same schema documented above (no new tables
except none at all -- every new page reads `tickets`/`messages`/`customers`
as they already existed):

- **Inbox** (`/dashboard/inbox`) -- the first conversation UI: customer,
  recent messages, AI participation, escalation state, linked ticket.
- **Customers** (`/dashboard/customers`) -- the first UI over `customers`.
- **AI Assistant** (`/dashboard/assistant`) -- the first working AI
  integration that answers an original question rather than only
  explaining a Sentinel conclusion, scoped to one question/one answer,
  written to `tickets`/`messages` as a real, reviewable conversation (see
  `src/lib/assistant/actions.ts` and the new
  `generateCustomerAnswer` in `src/lib/ai/analyst.ts`).
- **Insights** (`/dashboard/insights`) -- the prior Sentinel dashboard
  content, moved here once `/dashboard` itself became the lighter
  Customer Operations Home.

No new database tables were required for any of it.
