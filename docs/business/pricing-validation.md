# Pricing Validation — Business (Phase 22E)

No billing changes in this phase. No Stripe work. This is validation only:
the specific questions the Phase 22 handoff asks -- who buys, what problem
is expensive enough to pay for, what it replaces, what budget it competes
for -- answered directly, in business terms. `docs/product/pricing-
validation.md` (Phase 19F) covers the same ground from the conversation-
script angle (objections, per-tier value proposition); this document
answers the underlying business questions those scripts are built on.

## Who buys

The support lead or head of support/customer operations at a 20-200 person
B2B SaaS company (`docs/product/ideal-customer-profile.md`, Phase 18A) --
not a procurement function, not an executive buyer several layers removed
from the pain. This person: feels the problem directly (they're the one
fielding "is this really happening more, or does it just feel that way"),
and at this company size typically has enough budget authority to approve
a sub-$500/month tool without a multi-stakeholder sign-off process.

This matters for pricing specifically: a single-approver buyer means the
pilot-to-paid path can be fast, which is itself part of the value case for
staying at a price point this person can approve alone.

## What problem is expensive enough to pay for

Not "support tickets exist" -- that's true of every company with a support
team and isn't a reason to buy anything. The specific, expensive version:
a support lead spends real, repeated time (an afternoon here, a stand-up
there) manually digging through tickets to answer a question they should
already be able to answer -- "is this actually increasing, or does it just
feel that way" -- and either can't get a confident answer, or gets one too
late to be useful. That recurring manual-investigation cost, multiplied
across however many times a month it happens, is the expense Sentinel is
priced against. A company that has never felt this specific cost is not
a buyer yet, regardless of company size or tooling.

## What it replaces

Not an existing tool -- there is no direct competitor spend being
displaced. It replaces a combination of: unpaid manual time (a support
lead's own hours doing the digging by hand), and, more consequentially,
the cost of *not* catching a pattern early (a documentation gap or
recurring bug that keeps costing agent time every week it goes
unaddressed, silently, because nobody had a reliable way to notice it was
recurring). Existing ticketing tool spend (Zendesk/Intercom/Freshdesk,
typically $50-150/agent/month at this company size) is not displaced --
Sentinel is additive to that spend, not a substitute for it.

## What budget it competes for

Not the ticketing-tool line item. The realistic budget category is
discretionary team-tooling spend a support lead can approve directly --
the same category as a Slack app, a lightweight analytics tool, or a
single-purpose SaaS subscription, not a category that requires a
year-long procurement cycle or security review (which is also why
enterprises are explicitly out of the current ICP, per Phase 18A). At the
current placeholder tiers ($49 Starter / $199 Growth), the anchor is
"meaningfully less than one agent's time spent manually digging for
patterns each month" -- a number a support lead can sanity-check against
their own calendar without needing a finance conversation.

## What's confirmed vs. still unvalidated

**Confirmed by this audit** (structural, not yet customer-tested):
- The buyer has clear approval authority at the target company size --
  no invented finance stakeholder in the loop.
- The pricing tiers exist as real, displayed anchors and are backed by a
  working (if singular) real Stripe price -- a pilot can actually convert
  to paid today without new billing work.

**Still unvalidated, requires a real pilot conversation:**
- Whether $199/month is ever raised as an objection at all, or passes
  without comment (per `docs/product/pricing-validation.md`'s existing
  open question) -- this is the single most useful signal from an actual
  pricing conversation and cannot be answered from this repo alone.
- Whether the Starter/Growth tier boundary maps to how a real customer
  naturally describes their own usage, or feels arbitrary to them.

No pricing or billing code changes were made as part of this workstream --
per the handoff, this phase validates, it does not build.
