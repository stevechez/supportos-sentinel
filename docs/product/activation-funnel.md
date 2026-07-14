# Activation Definition (Phase 18C)

## What "activated" means

A vanity metric would be "signed up." Signing up costs nothing and proves
nothing about whether Sentinel is valuable. Activation has to require the
user to actually reach value.

**A user is activated when all four of these are true:**

```
Signed up
  +
Connected a support source
  +
Completed a first sync
  +
Viewed their first Sentinel insight
```

Concretely, in this codebase: `signed_up` activity logged, at least one
`synced_signals` activity logged with `newSignalCount > 0`, and the user has
actually seen `FirstInsightCard` render (which requires signals to exist and
no report to exist yet -- i.e. they were in the product past the connect
step). The fourth condition is the one that matters most: a user who
connected a source but never returned to look at what Sentinel found has not
activated, even though the first three conditions are met.

This builds directly on the funnel already instrumented in Phase 17H
(`docs/product/analytics-funnel.md`) -- `signed_up` -> `synced_signals` ->
`created_baseline_report`. Establishing a baseline is a stronger signal than
just viewing the first insight (it's an explicit action the user took, not
just a page render), so **`created_baseline_report` is used as the
activation event** in practice: it can only happen after the user has seen
`FirstInsightCard` and chosen to act on it.

## Activation Funnel

Example shape (illustrative numbers, not live data -- this pilot has a
single organization so far):

```
100 visitors
  |
  v
 20 signups          (20% of visitors)
  |
  v
 10 connected sources (50% of signups -- the drop here is what
  |                    OnboardingBanner exists to close)
  v
  8 first insights     (80% of connections -- sync working reliably)
  |
  v
  3 active customers   (37.5% of first insights -- activated AND still
                         returning after the first session)
```

The two drop-off points worth watching in a real pilot:

- **Signup -> connected source.** If this gap is large, the problem is
  almost certainly the "connect" step's clarity (see the confusion point
  documented in `pilot-experience-audit.md` about supported sources not
  being visible pre-connection), not the product's value -- the user hasn't
  seen anything yet.
- **First insight -> active customer.** If this gap is large, the problem is
  the insight itself: either it wasn't valuable, or it wasn't clearly
  actionable. This is exactly what Phase 18H's interview questions are
  designed to surface directly from the customer.

## How to read it

Same query pattern as `analytics-funnel.md`, extended with the pilot
dashboard queries in `pilot-dashboard.md`. No new instrumentation was added
in this phase -- `signed_up`, `synced_signals`, and `created_baseline_report`
already cover the whole funnel from Phase 17H.
