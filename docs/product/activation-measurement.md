# Activation Measurement (Phase 20C)

Phase 18C defined activation (`docs/product/activation-funnel.md`):
signup + connected source + completed sync + reached first insight, with
`created_baseline_report` as the concrete activation event. Phase 20C
validates that definition against real measurement and makes it visible on
the founder dashboard rather than only a written definition.

## The assumed funnel

```
Signup -> Connect source -> Sync data -> View first Sentinel insight
```

## Is this the right funnel?

Structurally, yes -- confirmed again in this phase's audit. There is no
step this app's actual UI inserts between signup and connecting (no
separate "create organization" screen, no required setup wizard), and no
step between connecting and syncing (connecting *is* syncing, Phase 10A).
The funnel the product enforces matches the funnel the handoff assumes.

What's still unvalidated is whether "first insight" is the right definition
of the *aha moment* specifically, versus a proxy for it. `FirstInsightCard`
loading is necessary but the real aha moment -- confirmed in Phase 19A's
founder walkthrough -- is the customer recognizing the specific finding as
real ("we didn't know to look for that"). That recognition isn't something
the product can measure directly; it's exactly what
`docs/customer/interview-template.md`'s "Reaction to Sentinel" section
exists to capture. Activation rate measures reaching the moment; the
interview measures whether the moment actually landed.

## What's measured now

Computed on `/dashboard/founder` from the same `activity_log` events as
Phase 17H/18C's funnel, extended with the exact per-organization dates via
`sentinel_reports`:

- **Activation rate** -- percentage of organizations that have reached a
  first health report (their first insight, made durable by establishing
  a baseline).
- **Time to value** -- days between an organization's signup date and its
  first health report's `created_at`. Averaged across activated
  organizations; shown as "--" when none have activated yet, never as 0 or
  a misleading placeholder.
- **Drop-off points** -- counted, not just described: how many
  organizations never connected a source at all, and how many connected
  but never reached a first insight. These are the two places
  `docs/customer/pilot-process.md`'s weekly cadence should look first when
  a pilot stalls.

All of this comes from `summarizeFounderPilots()` in
`src/lib/founder/data.ts` -- pure aggregation over data the founder
dashboard already fetches for other reasons, not a new analytics query
path.

## What this doesn't measure yet

With a single real organization in this environment, none of these numbers
are meaningful as statistics yet -- they're correct in their calculation
but not yet evidence of anything. This becomes real the moment three or
more real pilots are running. Documented here so the definition and the
measurement code are validated in advance of having data worth measuring,
not built reactively once someone asks for it.
