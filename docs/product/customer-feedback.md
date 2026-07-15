# Customer Feedback System (Phase 18D)

Not a feedback SaaS. One small table (`customer_feedback`, migration
`20260714110000_sentinel_customer_feedback.sql`), reusing the same
organization/member/RLS pattern as every other table in this schema, plus
the same `activity_log` audit trail (Phase 16A) that everything else already
writes to.

## What's captured

| Field | Notes |
|---|---|
| Customer | `member_id` + `organization_id`, resolved server-side from the logged-in session -- never trusted from the client |
| Question / message | Free text, required |
| Feedback type | One of four fixed categories (below) |
| Priority | `low` / `normal` / `high`, defaults to `normal`. Not settable by the customer -- triage is a staff action |
| Status | `new` / `reviewed` / `resolved`, defaults to `new`. Staff-only to change (requires `admin` role) |
| Context | Optional free text identifying where the feedback came from (e.g. `feedback_widget`, `ai_executive_brief`) -- lets the team tell "someone opened the feedback panel" apart from "someone reacted to a specific insight" without needing separate tables |

## Categories

Matching the handoff's own examples verbatim, so the category a customer
picks is the sentence they'd say out loud:

- **Confusion** -- "I don't understand..."
- **Missing capability** -- "I wish it could..."
- **Bug** -- "This does not work..."
- **Value** -- "This saved me time..."

## Where it's captured

1. **The feedback widget** (Phase 18E) -- a persistent "Feedback" button on
   every dashboard page, opening a short form: pick a category, write a few
   words, submit. This is the general-purpose entry point.
2. **Per-insight "Was this useful?"** (Phase 18E) -- a lightweight thumbs
   up/down attached to the AI Executive Brief, requiring no typing. Thumbs
   up logs as `value`, thumbs down as `confusion`. This is the fast path for
   the one moment (right after reading an AI explanation) where a reaction
   is easy to give and easy to lose if it requires opening a form.

Both paths call the same `submitFeedbackAction` (`src/lib/feedback/actions.ts`)
-- one write path, one place to reason about validation and authorization.

## How the team reads it

`getRecentFeedback()` (`src/lib/feedback/data.ts`) reads an organization's
feedback newest-first, joined to the member's display name. No dedicated
feedback-review UI was built in this phase -- see `pilot-dashboard.md` for
how feedback volume and recent items are surfaced for internal visibility
without a new page.

## Update (Phase 20D) -- turning feedback into decisions

Two founder-side triage columns were added (migration
`20260715091000_sentinel_customer_feedback_decision.sql`): `decision` and
`decision_notes`. These are set by the founder after reading an item, never
collected from the customer -- the capture surfaces above are unchanged.

**Decision categories:** Build, Fix, Document, Ignore, Investigate. Set
from a dropdown in `/dashboard/founder`'s feedback triage section
(`src/components/founder/feedback-decision-select.tsx`), via the
founder-gated `setFeedbackDecisionAction`
(`src/lib/founder/actions.ts`) -- the first mutation on this table that
isn't the customer's own submission.

The "Problem / Frequency / Impact / Requested solution" framing from the
Phase 20 handoff is deliberately not four more structured fields. Problem
and requested solution are already the `message` field in the customer's
own words -- adding separate boxes would ask them to fill out a form
instead of just telling us what happened. Frequency and impact are better
read across feedback items (does the same theme recur across
organizations?) than logged per item by the customer, who usually can't
judge frequency across the whole customer base anyway. `decision_notes` is
where a founder records that reasoning when it's not obvious from the
decision alone.

## What was deliberately not built

- No NPS score, no survey, no scheduled prompt asking for a rating.
- No feedback categorization AI -- the customer picks the category, plain
  and deterministic.
- No public feedback board or roadmap -- this is a pilot listening
  mechanism, not a community feature.
