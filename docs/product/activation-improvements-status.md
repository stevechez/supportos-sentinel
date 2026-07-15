# Activation Improvements Status (Phase 20H)

The Phase 20 handoff is explicit: activation improvements (onboarding
changes, copy changes, empty states, guided setup) come **only after
pilot evidence** -- "do not redesign based on assumptions."

## Status: deliberately not done in this phase

This environment has one real organization (the founder's own), not real
pilot customers yet. Any onboarding or copy change made right now would be
based on the same kind of founder assumption the handoff explicitly warns
against, even a well-reasoned one. The correct action this phase is to
finish building the *measurement* (Phase 20C's activation rate/time-to-
value/drop-off tracking, Phase 20B's pilot tracking, Phase 20D's feedback
decisions) so that once real pilots run, activation improvements have
actual evidence to point at instead of a guess.

## The one exception, and why it doesn't violate this principle

Phase 19B made one onboarding copy change (clarifying that "SupportOS"
means the customer's existing ticketing tool). That was not built on
assumption -- it was built on a direct, repeated observation across two
separate audits (Phase 18B and Phase 19A) of the same confusion point in
the *existing* UI, not a hypothesis about what might help. It also cost
nothing to reverse if pilot evidence contradicts it. Genuine assumption-
based redesign -- restructuring the onboarding flow, adding a guided setup
wizard, changing empty states speculatively -- is what's being deferred
here, not literally every copy fix regardless of evidence.

## What would trigger real activation work

- Phase 20C's drop-off counters showing a consistent pattern across
  multiple real pilots (not just one), at either the connect step or the
  sync-to-insight step.
- A specific, repeated confusion point named independently by more than
  one pilot customer in `docs/customer/interview-template.md`'s
  "Confusing areas" section.
- A `customer_feedback` item with `feedback_type = 'confusion'` that
  recurs across organizations rather than appearing once.

Until one of those exists, this workstream stays a placeholder by design.
