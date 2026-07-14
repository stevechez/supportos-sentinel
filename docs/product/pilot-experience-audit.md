# Pilot Experience Audit (Phase 18B)

Walked through as a first-time user who has never seen this product before,
using the ICP from `ideal-customer-profile.md` (a support lead at a 20-200
person B2B SaaS, evaluating whether to bring their team onto this). Every
step below was checked against the actual code, not assumed.

```
Landing page -> Signup -> Workspace creation -> Connect source -> Sync ->
First insight -> Return visit
```

## Landing page

Works as intended after Phase 17: the hero states the outcome ("Understand
your customer operations. Improve them every week.") without technology
jargon, and the Problem section names the pain in the visitor's own words
before explaining the product. No confusion here on a fresh read.

**Minor friction:** the top nav's "Solutions" link goes to `/products`,
which frames Sentinel as three separate products (Connect / Support /
Insights) with their own pages. A pilot prospect who clicks through there
before reaching the homepage's unified narrative could come away thinking
they're evaluating three tools, not one. Not fixed in this phase --
restructuring the product pages is a bigger change than Phase 18's "smallest
changes necessary" scope, but worth flagging for whoever owns positioning
next.

## Signup

Clean. Three fields (business name, work email, password), one button, no
separate "create an organization" step -- confirmed in the Phase 17 audit
and still true. Password minimum (8 characters) is stated inline, not
discovered via a failed submit.

**Confusion point:** the "Check your email" screen after signup doesn't set
an expectation for how long the confirmation should take, or what to do if
it doesn't arrive within a few minutes beyond "check spam." A first-time
user waiting on a confirmation email with no time bound is a classic drop-off
point. Left as-is for this phase (a timing promise the team can't actually
guarantee would be worse than no promise), but the FAQ (Phase 17G) already
covers "what if I get stuck," which mitigates this.

## Workspace creation

Invisible to the user, which is correct -- `ensureWorkspace()` creates the
organization automatically from the business name collected at signup. No
friction, because there's no step here for a user to be confused by.

## Connect source

One button ("Connect SupportOS") on `OnboardingBanner`. Clear as far as it
goes, but it assumes the user already knows they're connecting *SupportOS*
specifically -- a first-time user coming from Zendesk or Intercom (the ICP's
actual tools) has no visible confirmation that their tool is supported
before they click. The button doesn't say what "SupportOS" is in Sentinel's
vocabulary, and there's no visible list of supported sources anywhere in the
onboarding flow itself (it's only in `/faq` and `/resources`, both outside
the logged-in flow). This is a real confusion point for the target ICP and
is worth a copy fix in a future phase -- not changed here, since Phase 18's
mandate is to observe and document, not rebuild onboarding UI mid-audit.

## Sync

The click *is* the sync (Phase 10A/10C) -- no separate "click connect, then
click sync" two-step. Good; removes a step a first-time user could get stuck
between.

**Gap:** if the sync silently returns zero new signals (e.g. a demo
environment with no ticket data yet), the user sees the same onboarding
banner again with no explanation of what just happened. The FAQ now answers
"what happens if a sync fails" (Phase 17G), but a *zero-result* sync isn't a
failure and isn't currently distinguished from one in the UI. Documented
here as a gap; the fix belongs with whoever next touches
`OnboardingBanner`/`syncSupportOsSignalsAction`.

## First insight

Strong. `FirstInsightCard` shows real numbers (conversations, tickets,
knowledge gaps analyzed) immediately, states what was found in plain
language, and offers one clear next action ("Establish Baseline"). This is
the moment the ICP's buying trigger ("I want to know if this is actually
happening more") gets answered directly. No changes needed.

## Return visit

The full dashboard hierarchy (Phase 13A) answers "how are we doing / what
changed / what's becoming a problem / what matters most / what should we do"
in that order -- a returning user doesn't have to re-orient themselves each
time. Operational Memory (Phase 12) means a returning user who fixed
something last week can see whether it worked, which is exactly what a
support lead would want on a second visit.

**Gap found and fixed in this phase:** there was no way for a returning user
to say anything back to the team building this -- no feedback mechanism
anywhere in the product. Addressed in Phase 18E (feedback widget + per-insight
"was this useful" prompts).

## Team / invite

**Gap, not fixed in this phase:** the ICP is a team of 5-20 agents, but there
is no UI anywhere to invite a teammate, despite an `invitations` table and a
`redeem_invitation()` RPC already existing in the schema with zero
application code using them. A pilot customer who wants to bring their team
in beyond the one person who signed up currently cannot, through the UI.
This is a real limitation for a team-based pilot, but building a full invite
flow is a genuine feature addition, not an audit-driven copy or UI fix --
inconsistent with Phase 18's "learn before scaling" principle and its
explicit instruction to optimize for understanding pilot behavior, not for
shipping more capability. Recommendation: if early pilot interviews (Phase
18H) surface this as a real blocker rather than a hypothetical one, that's
the signal to build it in a future phase -- not before.

## Summary

The core loop (signup -> connect -> sync -> first insight -> return) is
solid and required no fixes. The two real gaps found -- no feedback channel,
and no team invite flow -- are handled differently: the first is fixed in
this phase (it's cheap, safe, and directly serves "feedback quality," a
Phase 18 goal); the second is documented and deliberately deferred, because
building it now would be scaling before learning whether it's actually
needed.
