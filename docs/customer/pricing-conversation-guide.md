# Pricing Conversation Guide (Phase 20F)

For testing willingness to pay directly with pilot customers, day-30 onward
(see `docs/customer/pilot-checklist.md`). No billing changes come from
this -- this is a conversation script, not a checkout flow. Read alongside
`docs/product/pricing-validation.md` (the founder's internal prep on
expected buyer/budget/objections) -- that doc is what to know going in;
this one is what to actually ask.

## Confirm the buyer

Don't assume the person you piloted with is the person who'd actually
approve payment. Ask directly: **"Who else would need to be involved in a
decision to pay for this?"** Common answers to expect: Head of Support,
a Customer Success leader, or an Operations leader signing off alongside
them. If it's just them, that's a faster path; if it's not, find out who
else needs to see value before the deal can move.

## Confirm the budget category

Ask: **"What would this replace or come out of, budget-wise?"** Support
tooling spend, a headcount-adjacent line (time saved = partial FTE), or
something else entirely. This matters more than the raw number -- a
$199/month tool competing against a support agent's time is an easy
comparison; the same price competing against "nothing, we don't have a
line item for this" is a harder sell regardless of the actual value
delivered.

## Test pricing reaction

Show the three tiers as they exist today (`docs/product/pricing-validation.md`'s
Starter/Growth/Enterprise breakdown) and watch for where their attention
goes, not just what they say. Then ask, in this order:

**"What would make this an easy yes?"**
Listen for whether the answer is about price, or about something else
entirely (team seats, a specific missing feature, internal budget timing).
A price objection and a value objection sound similar but mean very
different things for the roadmap.

**"What would prevent purchase?"**
The negative framing of the same question on purpose -- sometimes surfaces
a different, more honest answer than the positive framing does.

**"Who else needs to approve this?"**
Ask again here even if covered above -- the answer sometimes changes once
real pricing is on the table instead of a hypothetical.

## After the conversation

Log the outcome in `docs/customer/interview-template.md`'s buying-intent
section (if this is combined with a day-30 interview) or as its own note.
Specifically capture: did they name a real objection, or was the
conversation more like "sounds fine, let me check"? The second one usually
means the real objection wasn't surfaced yet -- don't record it as a yes.
