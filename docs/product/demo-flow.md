# Demo Flow (Phase 21G)

An end-to-end demonstration a prospect can experience live, not just be
told about. Every step below is a real screen backed by real data --
nothing here is staged copy. Reuses the existing password-reset demo
story that's been the running example since Phase 9's seed data wherever
possible, plus the new AI Assistant for the one step that previously had
no real UI to point to.

Companion to `docs/product/unified-demo-story.md` (an earlier session's
6-step conversation-first script). This document follows the handoff's
own sequence more literally -- starting from a live question, not from an
existing conversation -- and is the one to use when a prospect wants to
see something happen in real time rather than tour what already exists.

## The flow

### 1. Customer asks a question

Open **AI Assistant** (`/dashboard/assistant`). Type a real support
question -- for continuity with the running demo story, something like
"How do I reset my password?" Fill in a customer name/email if you want
it attributed to a specific person, or leave it blank and it's attributed
to "Demo Customer."

### 2. AI responds

Click Ask. Within a few seconds, a real answer comes back from the
configured model (`generateCustomerAnswer`, `src/lib/ai/analyst.ts`) --
not a canned script. Point out the disclosure text under the chat box:
one question, one answer, no memory of prior turns, no actions taken.

### 3. Conversation stored

Say: "That wasn't just a chat window -- it just became a real
conversation." Open **Inbox** (`/dashboard/inbox`) and find the new
conversation at the top of the list, tagged "Handled by AI." Point out
the customer name, the ticket reference, and the message count (two:
the question and the answer).

### 4. Ticket created (when appropriate)

Point out that the conversation already *is* a ticket -- in this schema
a conversation and its ticket are the same underlying record (see
`docs/architecture/platform-audit.md`), so there's no separate "ticket
was created" step to show; it's created the moment the question comes in.
If you want to show an escalation instead of an AI-handled resolution,
use one of the seeded password-reset tickets that has a human agent
message after the AI's -- those show "Escalated to human" instead.

### 5. Sentinel identifies a recurring issue

Because this org's seed data already has several password-reset tickets
(Phase 9's continuity story), asking the same kind of question through
the AI Assistant a couple of times makes it eligible to join that
existing pattern once the next SupportOS sync runs. Open **Insights**
(`/dashboard/insights`) and point at the password-reset finding already
there -- open its detail to show the Phase 21E provenance section
("Where this came from"), which lists the actual conversation subjects
behind it. Say: "Sentinel isn't summarizing in the abstract -- this
traces back to real conversations, including the one we just had."

### 6. Recommendation generated

Still on Insights, point at the recommendation linked to that finding
(usually a documentation or self-service improvement). Say: "This is
what Sentinel suggests doing about it -- Sentinel never makes this change
itself, a person decides."

### 7. Health score improves after resolution

Open the **Customer Operations Home** (`/dashboard`, the sidebar logo) and
point at the Executive Operations summary: AI handled count, escalations,
patterns detected, recommended improvements, and the health score in one
line. If this org has a completed-improvement history (Phase 7's
lifecycle tracking), point at the Recent Improvements card on Insights
showing a real before/after score change tied to a resolved
recommendation -- the same "AI explains a measured result, never predicts
one" discipline every phase since Phase 7D has held to.

## What this demo deliberately does not claim

- The AI Assistant does not remember previous questions, take account
  actions, or resolve anything beyond replying in words -- say this
  explicitly if a prospect asks "can it do X."
- Sentinel does not act on its own -- every finding and recommendation is
  something a person reviews and decides on.
- The health score improvement in step 7 is only shown if this
  organization actually has one -- never claim a number that isn't real
  for the org being demoed.

## Reused demo data

No new seed data was created for this document. The password-reset story
(tickets seeded across Phases 9, 11, and referenced throughout) is reused
as-is; the only new element is that the AI Assistant lets a live question
join that story in real time during a demo instead of only pointing at
data seeded in advance.
