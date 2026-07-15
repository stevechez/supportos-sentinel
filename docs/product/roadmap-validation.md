# Roadmap Validation (Phase 19H)

There is no single formal product roadmap document in this repo -- future
ideas exist scattered across phase audits, as deferred items and "not built
yet" notes. This document collects every one of them found so far and
classifies each through the lens of customer value, per the Phase 19
handoff. **No roadmap changes are made here** -- this is evaluation only.

## Classification key

- **Must Have** -- blocks activation or trust for the ICP as currently
  defined; without it, pilots fail for reasons unrelated to product value.
- **Nice to Have** -- would improve the experience but isn't blocking
  anything observed so far.
- **Customer Requested** -- has actually come up in a real customer
  interaction (or the interview/objection scripts anticipate it coming up).
- **Founder Assumption** -- an idea that exists because it seems reasonable
  or technically convenient, with no customer evidence yet either way.

## The list

### Team invite flow

Schema already exists (`invitations` table, `redeem_invitation()` RPC) with
zero application code using it. First flagged in Phase 18B's pilot
experience audit.

**Classification: Customer Requested (anticipated) / Nice to Have (until
confirmed).** The ICP is a 5-20 person team, and `docs/customer/common-
objections.md` already anticipates this coming up in pilot conversations.
But it hasn't actually been requested by a real customer yet -- it's a
well-reasoned guess. Reclassify to Must Have the moment a real pilot names
it as a blocker (per the "learn before scaling" principle from Phase 18);
don't build it preemptively.

### Clarify supported sources before the "Connect" click

The onboarding flow assumed the customer already knew "SupportOS" means
"your existing ticketing tool." Flagged in Phase 18B and again in Phase
19A's founder walkthrough.

**Classification: Must Have -- fixed in this phase.** This was pure
clarity, not new capability, with low effort and high certainty of value,
so rather than only documenting it, `OnboardingBanner` was given one
explanatory line in Workstream 19B. Included here as a record of the
reasoning, not as an open item.

### Distinguish a zero-result sync from a failed sync in the UI

Flagged in Phase 18B. Currently both look identical to the user.

**Classification: Nice to Have.** Confusing, but self-resolves once a pilot
customer has enough ticket volume that zero-result syncs stop happening
regularly. Worth fixing, not urgent.

### A real cross-organization admin/staff role system

The founder dashboard (Phase 19C) works around not having this via an email
allowlist and a service-role read-only query. Noted as a "build later"
candidate in Phase 18I's pilot-dashboard doc.

**Classification: Nice to Have, becomes Must Have only at real scale.** At
pilot-count organizations, the allowlist approach is safer (smaller attack
surface) than building real infrastructure. This is explicitly a "build
when the current approach breaks," not now.

### Enterprise SSO

Explicitly out of scope in Phase 16, 18, and 19 handoffs.

**Classification: Founder Assumption.** No pilot in the ICP (20-200 person
companies) has asked for this, and it's the kind of feature that mostly
matters to a buyer segment (enterprise) this pilot phase deliberately isn't
targeting yet.

### More connectors beyond SupportOS / CSV import

CSV import already shows as "Coming Soon" in the Connected Sources card
(Phase 10B) but was never built. Additional real-time connectors (Zendesk,
Intercom APIs directly) are unbuilt.

**Classification: Customer Requested, conditionally.** The ICP is
explicitly chosen (Phase 18A) to already fit what SupportOS can ingest --
so this shouldn't block early pilots. It becomes real the moment a
qualified pilot prospect can't be onboarded because their tool doesn't map
cleanly, which is a concrete, observable trigger to watch for rather than a
guess.

### Workflow automation / autonomous remediation

Never built, explicitly out of scope in every phase since Phase 14.

**Classification: Founder Assumption -- and likely permanently
deprioritized.** This conflicts with the product's core trust promise ("AI
explains, humans decide"), re-verified as recently as Phase 18G. Not a gap
to fill; a boundary to keep.

### Multiple real Stripe prices matching the three displayed tiers

Currently one real price backs all "Get started" CTAs regardless of which
tier a visitor reads (Phase 17D, explicitly a positioning device, not
billing infrastructure).

**Classification: Nice to Have, become Must Have when a real customer tries
to buy Growth specifically.** Per Phase 19F's pricing validation, it's not
yet known whether the tier boundary matters to real buyers -- find out
before building three real prices and the checkout logic to route between
them.

### Public feedback roadmap / community board

Explicitly declined in Phase 18D's feedback system doc.

**Classification: Founder Assumption, deprioritized.** A pilot-stage
product with a handful of customers doesn't need public feature voting --
direct interviews (`docs/customer/interview-template.md`) are higher
signal at this scale.

### Knowledge base / vector search wired up for real

Schema and RPCs exist (`knowledge_documents`, `knowledge_chunks`,
`match_knowledge_chunks_*`), unused by any application code. The unsafe
public RPC exposure was closed in Phase 18G, but the feature itself was
never built.

**Classification: Founder Assumption.** No pilot has asked for a knowledge-
base search feature -- it exists in the schema because of the platform's
broader history (the unused "chat agent" schema), not because of validated
customer need. Not on the near-term roadmap in any real sense.

## Summary

Of everything reviewed, exactly one item -- clarifying what "Connect
SupportOS" means before the click -- is a confident Must Have with no
customer validation needed first. Everything else genuinely depends on what
real pilots say, which is the entire point of this phase: the roadmap
should be built from evidence gathered via `docs/customer/interview-
template.md` and the founder dashboard, not from assumptions about what
seems useful.
