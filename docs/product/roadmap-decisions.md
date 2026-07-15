# Feedback -> Roadmap Decisions (Phase 22D)

A framework for turning real customer feedback into roadmap decisions,
using the triage categories already built in Phase 20D
(`FeedbackDecision` in `src/lib/feedback/types.ts`: build / fix / document
/ ignore / investigate) and the founder dashboard's feedback triage list
(`/dashboard/founder`). This document defines how a decision gets made, not
a new system to make it in -- the decision field already exists and is
already settable per feedback item from the founder dashboard.

## The framework

```
Problem            What is the customer actually describing? Use their
                    words (the feedback_type categories -- "I don't
                    understand...", "I wish it could...", "This does not
                    work...", "This saved me time...") to anchor this,
                    not a reinterpreted feature request.

Frequency           Has this come up once, or from multiple organizations?
                    A single mention is a data point. The same problem from
                    two or more pilots is a pattern worth prioritizing.

Customer impact      Does this block activation or trust (Must Have, per
                    docs/product/roadmap-validation.md's classification),
                    or would it just be nicer (Nice to Have)? Does it come
                    from a pilot who is close to converting, or one who
                    already churned?

Decision             One of the five existing categories:
                      - Build     -- a real capability gap, worth roadmap
                                     time
                      - Fix       -- something broken, not a feature gap
                      - Document  -- the capability exists; the customer
                                     didn't know or find it
                      - Ignore    -- a one-off preference, not a pattern,
                                     doesn't block activation or trust
                      - Investigate -- unclear yet whether it's Build, Fix,
                                     or Document; needs a follow-up
                                     conversation before deciding
```

## Worked examples (using this repo's own accumulated findings)

These aren't customer feedback (no `customer_feedback` rows exist yet in
this pilot-of-one environment) -- they're friction points this project's
own phase audits have already surfaced, run through the framework as a
demonstration of how it should be applied once real feedback exists.

| Problem | Frequency | Customer impact | Decision |
|---|---|---|---|
| "Connect SupportOS" didn't say what tool that meant before clicking | Flagged twice, independently (Phase 18B, 19A) | Must Have -- blocked understanding at the very first step | **Fix** -- already fixed in Phase 19B; kept here as a record of the reasoning |
| Team invite flow has no UI (schema exists, unused) | Anticipated, not yet observed from a real customer | Nice to Have until confirmed | **Investigate** -- wait for a real pilot to name it as a blocker, per `roadmap-validation.md` |
| Asking the AI Assistant once doesn't produce an insight | Observed once, in this phase's own audit (Phase 22A), not from a customer yet | Unclear -- could be Must Have (confusing) or a correct/expected limitation | **Investigate** -- exactly the kind of finding that needs a real pilot conversation before deciding whether it needs product copy, a threshold change, or nothing |
| Zero-result sync looks identical to a failed sync | Flagged once (Phase 18B) | Nice to Have -- self-resolves with ticket volume | **Ignore** for now, per the existing classification -- revisit if it recurs |

## How this connects to the founder dashboard

The "Feedback triage" section of `/dashboard/founder`
(`src/app/(dashboard)/dashboard/founder/page.tsx`) already lets a founder
set a `FeedbackDecisionSelect` per item -- build/fix/document/ignore/
investigate, per Phase 20D. This document is the reasoning a founder should
apply before picking one, not a new field or a new page. No code changes
were needed for this workstream.

## What this deliberately does not do

- No scoring formula, no weighted prioritization matrix. Frequency and
  customer impact are read as plain evidence, not turned into a number --
  consistent with this project's "code calculates, humans decide" boundary
  even for roadmap decisions, which are not something AI participates in
  at all.
- No public roadmap or changelog. Per `roadmap-validation.md`'s existing
  finding, a pilot-stage product with a handful of customers is better
  served by direct interviews than a public voting board.
