# Unified Customer Operations Architecture Audit (Phase 21A)

> **Superseded by `docs/architecture/platform-audit.md`.** A later, more
> detailed Phase 21 handoff arrived in the same working session with its
> own audit checklist (ticket/conversation/message/customer UI; Chat Agent
> widgets/API routes/components/AI integration; Sentinel dashboard/
> intelligence/reports/recommendations) and its own target navigation.
> `platform-audit.md` is the current source of truth; this document is
> kept because its findings still hold and its framing ("connect the
> customer journey, not the codebase") is still the right mental model --
> just read the newer file first.

Required reading before any Phase 21 code changes. This document is the
factual record of what actually exists today -- not what the Phase 21
handoff assumes exists. Per the handoff's guiding principle ("connect the
customer journey, not the codebase"), the finding below changes the shape
of the whole phase: there is nothing to connect at the codebase level,
because there is only one codebase. The work is entirely about how that
one codebase's existing data is *presented*, not about integration.

## Summary finding

**Chat Agent, SupportOS, and Sentinel are not three systems. They are one
Next.js application reading one Postgres database, wearing three different
names in conversation.** There is no separate Chat Agent codebase, no
separate SupportOS codebase, and no API boundary between any of them. The
"unified experience" this phase asks for is a presentation and navigation
problem, not an integration problem.

## Existing components, and where they actually live

### "Chat Agent"

There is no Chat Agent application. There is no chat UI, no chat API
route, and no runtime code that has a customer-facing conversational
agent taking messages and responding. What exists instead:

- A `messages` table (16 rows in the live project) with a `sender` enum
  of `customer / agent / ai / system`, foreign-keyed to `tickets`. This is
  real data -- conversation transcripts attached to support tickets -- but
  nothing in `src/` or `packages/` writes to it. It's read-only from the
  app's perspective (`src/lib/signals/sync.ts` reads it to build
  conversation signals; nothing produces new rows).
- `/dashboard/intelligence` ("AI Assistants" in the nav), which reads as
  a live product surface but is **fully static**: a hardcoded array of
  three cards ("Customer Assistant", "Conversation Intelligence",
  "Knowledge Assistant") with fixed "Active" / "Ready" labels and no data
  fetching at all (`src/app/(dashboard)/dashboard/intelligence/page.tsx`).
  It describes capabilities that don't run.
- An unused schema cluster that appears to be leftover scaffolding for a
  chat-agent product that was never built: `agent_configs` (2 rows),
  `automations` (4 rows), `business_rules` (3 rows), `action_requests` (0
  rows), `knowledge_documents` (0 rows), `knowledge_chunks` (0 rows).
  Confirmed by grep: **zero references to any of these six tables
  anywhere in `src/` or `packages/`.** They have RLS enabled and, per
  Phase 18's security audit, three RPCs over the knowledge tables had
  their public EXECUTE grants revoked as an unused attack surface. They
  are dead schema, not a working feature.
- `apps/platform/` and `apps/marketing/` at the repo root contain nothing
  but a `.gitkeep` file each. They are empty placeholders, most likely
  scaffolding from an earlier, abandoned plan to split this repo into
  multiple apps -- consistent with the "Platform v2... undergoing
  consolidation" framing in `CLAUDE.md`. They are not in use and are not
  a real integration point for this phase.

**Conclusion:** "Chat Agent" is not a system to connect to. It is a
labeling problem plus one static, disconnected settings-style page, sitting
on top of real `messages` data that Sentinel already reads for something
else.

### SupportOS

Also not a separate system -- it's the name for this same app's own
`tickets` / `messages` / `customers` tables, plus the sync pipeline that
turns them into Sentinel signals:

- `tickets` (10 rows): `id, subject, status, priority, sentiment, intent,
  tags, ai_resolved, created_at`, scoped by `organization_id`.
- `messages` (16 rows): per-ticket transcript rows, `sender` enum as above.
- `customers` (2 rows): exists and is populated, but **zero references**
  in `src/` or `packages/` -- no code currently reads or writes it. Another
  quiet gap: real customer data with no surface showing it.
- `src/lib/signals/sync.ts` (`syncSupportOsSignals`) is the one real
  integration point: it pulls up to 200 recent tickets plus their message
  threads for an organization, runs them through two deterministic
  adapters (`src/lib/signals/adapters/supportos.ts` for ticket metadata,
  `adapters/conversations.ts` for message-thread patterns), and upserts
  the results as `sentinel_signals`. One function, one sync, both
  adapters looking at the same underlying rows from different angles.
- There is no dedicated "SupportOS" UI surface today. A user never sees
  their own tickets or conversations rendered as such -- they only see
  what Sentinel derived from them (signals, findings, recommendations).
  This is the actual gap the Phase 21D workstream should close: not a new
  system, just a first read-only view over `tickets` / `messages` /
  `customers` that already exist.

### Sentinel

The one fully-built layer. Routes: `/dashboard` (Overview),
`/findings`, `/recommendations`, `/reports`, `/dashboard/knowledge-gaps`,
`/dashboard/settings`, plus the founder-only `/dashboard/founder`.
Reads `sentinel_signals` -> `sentinel_findings` -> `sentinel_recommendations`
-> `sentinel_reports`, all deterministically computed from `tickets` /
`messages` via the sync path above, with AI used only to explain
already-computed results (the "code calculates, AI explains" boundary,
unbroken since Phase 6). This is the actual, working product.

## Current navigation (as of Phase 20)

`src/lib/navigation.ts`, rendered by `src/components/dashboard/sidebar-nav.tsx`:

```
Overview            /dashboard
Findings            /findings
Recommendations     /recommendations
Reports             /reports
Knowledge Gaps      /dashboard/knowledge-gaps
AI Assistants       /dashboard/intelligence   <- the static, disconnected page above
Settings            /dashboard/settings
```

Flat, seven items, Sentinel-only framing throughout (Findings/
Recommendations/Reports read as outputs of an analysis tool, not as part
of an operations platform). "AI Assistants" is the one item that actively
misleads -- it implies a working assistant layer that isn't there.

## Actual current data flow

```
tickets (SupportOS data, real, 10 rows)
   |
   +-- messages (thread per ticket, real, 16 rows) -- unused: customers (real, 2 rows, no reader)
   |
   v
src/lib/signals/sync.ts  (syncSupportOsSignals)
   |
   +-- adapters/supportos.ts       (ticket-metadata signals)
   +-- adapters/conversations.ts   (message-thread signals)
   |
   v
sentinel_signals  -->  sentinel_findings  -->  sentinel_recommendations  -->  sentinel_reports
                                                                                   |
                                                                                   v
                                                                    AI explanation layer (explains only)
```

Everything above the first arrow is one process, one database, one
Next.js app. There is no cross-system handoff to diagram.

## Integration gaps (the real ones)

These are the actual problems Phase 21B-21H should address -- note that
none of them are integration work in the traditional sense, because
there's nothing on the other side of an integration:

1. **No conversation surface.** `messages` and `customers` are real,
   populated, and completely invisible in the product. A user has never
   seen "here are your recent conversations" anywhere in this app.
2. **A disconnected page pretending to be live.** `/dashboard/intelligence`
   describes an "AI Assistant" that isn't running, with hardcoded
   "Active" status labels. This is the single most misleading surface in
   the product today and should either become real (a thin read view over
   `messages`) or be reframed honestly.
3. **No support-ops surface.** `tickets` exist and are the direct input
   to every Sentinel signal, but a user never sees "open tickets" or
   "pending escalations" as tickets -- only as already-transformed
   Sentinel output. There's no way to look at the raw operational picture
   Sentinel is drawing conclusions from.
4. **Findings lack conversation provenance.** `sentinel_findings` links
   back to `sentinel_signals`, which link back to tickets/messages, but no
   UI currently walks that chain for a user. An insight shows a
   conclusion ("recurring password-reset issue") without a visible path
   back to the actual conversations that produced it.
5. **Naming implies three products.** "SupportOS" (marketing/onboarding
   copy), "Chat Agent" (handoff terminology, not used in-app), and
   "Sentinel" (the nav, the settings page, the brand) are three names for
   one thing wearing different hats depending on which doc or screen
   you're looking at. This is a documentation/copy problem, not an
   architecture problem -- but it is the direct cause of "What is
   Sentinel?" confusion the handoff's success criteria names.
6. **`apps/platform` and `apps/marketing`** are empty and should not be
   mistaken for real separation points in later workstreams -- flagging
   this explicitly so 21B-21H don't try to "integrate" with directories
   that contain nothing.

## What this means for the rest of Phase 21

- 21B (navigation): a real restructuring task -- group existing routes
  under a shared frame, rename "AI Assistants" away from implying a live
  assistant that isn't there.
- 21C (conversation experience): net-new UI over already-existing
  `messages`/`tickets` data -- no new tables required.
- 21D (SupportOS surface): net-new UI over already-existing `tickets`/
  `messages`/`customers` data -- no new tables required.
- 21E (provenance): wiring already-existing foreign keys
  (signal -> finding -> the ticket/message rows behind it) into the UI --
  no new schema, a join and a link.
- 21F (executive view): a new read-only composition of numbers Sentinel
  already computes (signal counts, finding counts, recommendation counts) --
  no new computation.
- 21G/21H: documentation and audit work, no schema or route changes
  implied by anything found above.

No new tables, no new packages, no new apps, and no cross-system API are
needed anywhere in this phase. Every remaining workstream is a UI/copy
change over data that already exists in this one application.
