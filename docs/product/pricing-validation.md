# Pricing Validation (Phase 19F)

No billing changes in this phase -- the three placeholder tiers from Phase
17D (Starter $49, Growth $199, Enterprise Custom) stay exactly as they are,
still backed by the single real Stripe price. This document is preparation
for the pricing *conversation*, not a change to the product.

## Expected buyer

The support lead or head of support/customer operations -- the person who
feels the pain of repeated questions directly, not a procurement or finance
function. At the ICP's company size (20-200 employees), this person
typically has enough budget authority to approve a sub-$500/month tool
without a formal approval chain, which matters: a pilot that requires
multi-stakeholder sign-off before even starting is a much slower, riskier
pilot.

## Expected budget

Existing support tooling at this company size (Zendesk, Intercom, or
Freshdesk seat costs) typically runs $50-150/agent/month already -- Sentinel
isn't replacing that spend, it's additive. A reasonable mental anchor for
the buyer: Sentinel should cost meaningfully less than one agent's time
spent manually digging for patterns each month, and should be able to
justify itself against a single prevented repeat-ticket problem.

## Likely objections

See `docs/customer/common-objections.md` for the full response scripts.
The pricing-specific one: "This seems expensive for what it does" --
handled by reframing to the cost of the status quo (unaddressed recurring
issues), not by discounting.

## Value proposition per tier

**Starter ($49/month)** -- for a team just trying to answer "is this
actually a pattern, or does it just feel that way." One connected source,
recurring issue detection, weekly health score. The value proposition is
narrow and specific: replace a manual ticket search with an automatic one.

**Growth ($199/month)** -- for a team ready to track whether fixes actually
work over time. Unlimited sources, emerging risk detection (catch it before
it's a crisis, not after), and organizational memory (a real record of what
was tried and whether it worked). The value proposition shifts from "find
the pattern" to "manage the pattern over time" -- this is the tier the
ICP's buying trigger (a specific bad moment of not knowing if something's
increasing) most directly maps to.

**Enterprise (Custom)** -- for teams that need guided rollout and dedicated
support alongside everything in Growth. Not yet validated against a real
prospect; treat any Enterprise conversation as its own pricing discovery,
not an assumption to lead with.

## What pilots should validate

- Does the customer naturally describe themselves as a Starter or Growth
  buyer based on what they actually do with the product, or does the tier
  boundary feel arbitrary to them?
- Is $199/month a real objection point, or does it pass without comment?
  If it's never raised, that's itself useful signal that pricing isn't the
  current bottleneck -- activation and value clarity are.
