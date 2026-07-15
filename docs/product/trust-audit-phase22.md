# Product Trust Re-Audit (Phase 22G)

Phase 21H's re-audit (`docs/product/trust-audit-phase21.md`) closed with an
explicit flag: "any future workstream that gives AI a write path into
`tickets` or `messages`... explicitly out of scope for Phase 21... should
not be crossed without its own dedicated trust review." Phase 21D (v2)
then deliberately crossed exactly that boundary by building the AI
Assistant, per the user's explicit choice (via `AskUserQuestion`) to ship
a "minimal real version" rather than defer it. This document is that
dedicated trust review, now that Sentinel also analyzes customer
conversations the Assistant creates.

## 1. Data isolation -- re-verified

Every write the Assistant makes (`src/lib/assistant/actions.ts`) goes
through the same server-side Supabase client every other authenticated
write in this app uses -- never `createAdminClient()`. `organization_id`
on every insert (`customers`, `tickets`, `messages`, `activity_log`) comes
from `getCurrentMembership()`, never from client input. All four tables
have RLS enabled at the database level, unchanged since Phase 1/18. No new
service-role bypass was introduced. This matches Phase 21H's finding #3
and remains true.

## 2. AI behavior checklist

The handoff's explicit checklist, checked against the Assistant
specifically (every other AI capability in this codebase was already
re-verified read-only in Phase 21H and is unchanged):

**✅ Explains** -- Every other AI capability (`generate*` functions in
`src/lib/ai/analyst.ts`) still only explains already-computed findings.
Unchanged this phase.

**✅ Summarizes / ✅ Recommends** -- Same, unchanged.

**The Assistant is different by design** -- it answers an original
question rather than explaining a precomputed conclusion. This is
documented explicitly in `src/lib/ai/types.ts`'s `CustomerAnswer` comment
and was a deliberate, disclosed scope decision (Phase 21D), not an
oversight. It is still bounded:

**❌ Decide** -- The Assistant never sets a finding, priority, health
score, or any deterministic value. It writes exactly one thing: a
`messages` row containing its answer text, precisely the same shape as a
human agent's reply. `askAssistantAction` sets the ticket's own status
(`resolved`, `ai_resolved: true`) after answering -- this is the one place
worth naming directly: **the AI resolving its own ticket is a status
change, not a data decision** -- no finding, customer record, or health
score is touched, and the full record (question + answer) stays visible in
the Inbox for a human to review or reopen at any time. Nothing is hidden.

**❌ Modify customer data automatically** -- Confirmed by reading
`askAssistantAction` in full: it never updates an existing `customers` row
beyond creating one if it doesn't exist (matched only by exact email, only
on first contact), never updates `messages` it didn't just create, and
never touches any other customer's data. It has no update path into
anything a human already wrote.

**❌ Fabricate evidence** -- `CUSTOMER_ASSISTANT_SYSTEM_PROMPT`
(`src/lib/ai/prompts.ts`) explicitly forbids the model from claiming to
have taken an action ("never say 'I've reset your password'"). This was
verified present in the actual prompt text, not just described in a
comment. The Assistant answers the question asked; it does not claim
side effects it didn't perform.

## 3. The "no autonomous AI agents" line

`/trust` (Phase 17F) and the out-of-scope lists in Phase 15/18/21 all
state a boundary against autonomous AI agents acting without human
oversight. The Assistant does not cross this: it takes one action (write
one reply to one question) with no memory, no multi-step planning, no
ability to chain into further actions, and every action it takes is
immediately visible, reviewable, and reversible (a human can reopen the
ticket) in the same Inbox every other conversation appears in. It is
better described as "AI can now author one reply," not "AI can now act
autonomously" -- the distinction the Phase 21 handoff itself drew when
scoping this feature, and confirmed to still hold under this closer
re-read.

## 4. Failure mode -- re-verified safe

If the AI call fails (`AiUnavailableError` or any other exception), the
customer's question is still saved as a real, open, unresolved ticket --
confirmed by reading the `try`/`catch` in `askAssistantAction`: the ticket
insert and customer-message insert both happen *before* the AI call, so a
downstream failure never loses the customer's question or leaves a
half-written record. This matches "what happens today if a human hasn't
answered yet" rather than introducing a new error state.

## 5. Conversation visibility -- unchanged scope

Phase 21H flagged that raw `messages.body` is deliberately not surfaced in
list views (Conversations/Inbox show subject, status, counts, derived
outcome only). This still holds for the Inbox list. The Assistant's own
chat UI is the one place a user now sees message bodies directly, but only
for the conversation they are actively having -- not a general transcript
viewer surfacing other customers' message content. This is a narrower
exposure than a transcript viewer would be and doesn't trigger Phase 21H's
"deserves its own explicit decision" flag on its own; a real transcript
viewer for arbitrary past conversations would still need that review if
built later.

## Findings

No violations found. The one boundary Phase 21H flagged as requiring
dedicated review before being crossed (AI write path into
`tickets`/`messages`) was crossed deliberately in Phase 21D, and this
review confirms it was done within the same constraints every other write
path in this app already respects: RLS-scoped, non-service-role,
auditable, and reversible by a human. No fabrication path exists in the
system prompt or the code around it.

## What would trigger the next review

- Any future workstream that gives the Assistant multi-turn memory,
  the ability to take a second action based on its own first answer, or
  any write path beyond a single `messages` reply.
- Any future workstream that lets the Assistant modify an existing
  `customers` record (not just create one) or write to `tickets` fields
  other than status/resolution metadata.
- A general transcript viewer surfacing other customers' `messages.body`
  content outside the Assistant's own single-conversation UI.
