# Pilot Process (Phase 20A)

A repeatable process for running a Sentinel pilot -- not a CRM, just enough
structure that pilot 3 is run the same way pilot 1 was, so results are
comparable. Read alongside `docs/customer/pilot-checklist.md` (the
day-by-day checklist version of this same process) and the founder
dashboard at `/dashboard/founder` (where this process is tracked).

## Before pilot

**Customer qualification.** Match against `docs/product/ideal-customer-profile.md`:
20-200 person B2B SaaS, 5-20 support agents, already on Intercom/Zendesk/
Freshdesk. Don't run a pilot with a company that doesn't fit -- a pilot
that fails because the ICP was wrong teaches nothing about the product.

**Goals.** Write down, before the first call, what this specific pilot is
meant to teach -- not every pilot needs to answer every open question.
Some will be run primarily to validate activation, others primarily to
validate pricing (see `docs/product/pricing-validation.md`).

**Success criteria.** Agreed with the customer, not just assumed
internally -- see `docs/customer/success-metrics.md` for the default bar
(one real change made, would keep using it if asked today), adjusted per
pilot if the customer has a more specific goal in mind.

**Data readiness.** Confirm the customer's ticketing tool maps to what
SupportOS can actually ingest (real tickets/messages, not just a CSV
export of summary counts) before scheduling the onboarding call --
otherwise the call gets spent on a connection problem instead of the
product.

## During pilot

**Weekly cadence**, every week the pilot is active:

- **Review insights.** What did Sentinel surface this week? Would you have
  found it without Sentinel?
- **Collect feedback.** Check `/dashboard/founder`'s feedback triage
  section -- has anything come in? If nothing has, that's itself a signal
  worth noting (silence isn't neutral -- see `docs/customer/success-metrics.md`).
- **Observe behavior**, not just self-report. The founder dashboard shows
  connected source, first insight date, and last activity per
  organization -- use it to notice a pilot that's gone quiet before the
  customer says so.
- **Document blockers.** Anything that stopped the customer from acting on
  an insight -- write it down verbatim, don't paraphrase into something
  that sounds more like a feature request than what was actually said.

Update pilot status in `/dashboard/founder` as it changes (see status
definitions below) -- this is what makes "active pilots" mean something on
the summary view rather than every organization being permanently
"invited."

## After pilot (day 30)

**Continued usage.** Are they still coming back without being prompted?

**Willingness to pay.** Run the interview
(`docs/customer/interview-template.md`), specifically the buying-intent
section. Don't infer this from enthusiasm alone.

**Expansion opportunity.** Would this customer want to add teammates, more
sources, or does the current single-seat, single-source shape already
cover what they need? (Team invites are a known gap -- see
`docs/product/roadmap-validation.md`.)

## Pilot statuses

Tracked per organization on `organizations.pilot_status`, editable directly
from `/dashboard/founder`:

| Status | Meaning |
|---|---|
| Invited | Qualified, not yet signed up |
| Onboarding | Signed up, working through connect -> sync -> first insight |
| Active | Activated and using the product week to week |
| Reviewing | Day-30 evaluation in progress |
| Converted | Decided to pay |
| Paused | Stalled or intentionally on hold -- not the same as churned; revisit later |

`pilot_started_at` is stamped automatically the first time a pilot moves to
Active -- it answers "how long has this pilot actually been running,"
which is a different (and usually more useful) number than signup date.
