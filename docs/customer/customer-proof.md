# Customer Proof System (Phase 22F)

The Phase 22 handoff asks for a before/after proof system built strictly
from customer-confirmed outcomes -- no invented metrics. Most of this
already exists: `docs/customer/value-evidence-log.md` (Phase 20E) is the
raw capture log, and `docs/customer/case-study-template.md` (Phase 20G) is
the polished output format. This document is the system that connects
them -- the rule for what counts as proof, and the exact path a piece of
customer feedback takes from "someone said something good" to "something
publishable."

## The one rule that governs everything here

**A number, a quote, or a claim only ever enters this system if a customer
said it themselves.** Never rounded up, never inferred, never calculated
on the customer's behalf and attributed to them. If a customer says "it
felt faster" with no number, the proof entry says "it felt faster" --
not "20% faster." An empty or vague entry is more valuable to this system
than a confident-sounding invented one, because it stays trustworthy the
one time it matters: when a prospect asks "is this real?"

This is the same boundary the product itself enforces between deterministic
calculation and AI explanation, applied to marketing and sales material
instead of application code -- Sentinel doesn't fabricate evidence about a
customer's operations, and this system doesn't fabricate evidence about
Sentinel's own results.

## The pipeline

```
1. Customer says something          Interview response, in-app feedback
   (raw, unfiltered)                 widget, follow-up email, a Slack
                                     message during the pilot -- wherever
                                     it happens.

2. Logged verbatim                  docs/customer/value-evidence-log.md
                                     One entry per before/after pair,
                                     customer's own words, source noted.
                                     Vague stays vague -- not smoothed over.

3. Reviewed for a real before/after A log entry only becomes case-study
                                     material once there's a clear before
                                     state, a specific Sentinel finding
                                     that connects to it, and a specific
                                     action the customer took because of
                                     it. Most entries won't reach this bar
                                     immediately, and that's expected.

4. Written up                       docs/customer/case-study-template.md
                                     Every section traces back to a
                                     specific log entry or interview
                                     answer. The publishing checklist at
                                     the bottom of that template is the
                                     gate -- consent, traceability, no
                                     invented numbers.

5. Published (only after)           Customer has explicitly agreed to be
                                     named, or the study is anonymized
                                     with their knowledge. Never published
                                     from an entry alone without this step.
```

## Before/after template (quick reference)

The same shape as `value-evidence-log.md`'s entry template, restated here
as the minimum bar for something to count as "proof" at all:

```
Before (customer's own words):
After (customer's own words):
What actually changed (a specific, verifiable action):
Source (interview / feedback widget / follow-up email / other):
Confirmed by customer: yes / no
```

The "confirmed by customer" line is the addition this phase makes explicit:
an internal observation ("the health score went up after they connected")
is not proof on its own -- it's a hypothesis until the customer confirms,
in their own words, that it mattered to them. Sentinel's own health score
or finding data can motivate reaching out to ask, but it never substitutes
for the customer's confirmation.

## What this phase did not build

- No new log file, no new template -- `value-evidence-log.md` and
  `case-study-template.md` already existed and already enforce this
  standard; this document makes the connecting rule explicit rather than
  duplicating either file.
- No automated pipeline pulling quotes from feedback or messages into the
  log. Every entry is still a human decision to log something as proof,
  deliberately -- automating that step would risk exactly the kind of
  quiet metric-inflation this system exists to prevent.

## Current state

No real pilot entries exist in `value-evidence-log.md` yet -- this is
expected at this stage and is itself tracked as a signal there, not hidden.
This document is ready for the first entry the moment a real pilot produces
one.
