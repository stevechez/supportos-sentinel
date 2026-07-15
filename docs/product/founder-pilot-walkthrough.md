# Founder Pilot Walkthrough (Phase 19A)

Walked the full loop as a support leader would during a 30-minute product
demo, using the app exactly as it exists today -- no developer shortcuts,
no seeded state the customer wouldn't have.

```
Landing page -> Signup -> Email/login -> Organization created ->
Connect SupportOS -> Sync -> First insight -> AI brief -> Feedback submission
```

## Landing page

"Understand your customer operations. Improve them every week." answers
"what is this" immediately. No explaining required here.

## Signup

Three fields, one button. No explaining required -- this is the moment the
Phase 17/18 audits already got right and it's held up on re-check.

## Email / login

**Point that needs explaining, live:** after signup, the "Check your email"
screen has no visible time estimate. In a live 30-minute demo this is the
one moment a founder has to fill dead air ("it usually arrives in under a
minute, let's talk through what you'll see next while we wait"). Not a bug
-- just a fact about the demo that's worth having a line ready for, captured
in `docs/customer/onboarding-call.md`.

## Organization created

Invisible, correctly. Nothing to explain -- the org just exists by the time
the customer is looking at the dashboard.

## Connect SupportOS

**Confusion point found, and fixed in this phase:** the button says
"Connect SupportOS," and this confirmed the finding from Phase 18B's audit
-- the UI itself never said what was being connected in the customer's own
vocabulary. Unlike most findings in this doc, this one was cheap enough to
fix directly rather than only document: `OnboardingBanner` now has one
added line ("SupportOS is the ticketing connection -- for most teams,
that's your existing Zendesk, Intercom, or Freshdesk data.") so a founder
doesn't have to say it out loud every single time. Still worth saying
explicitly on a live call too (see `docs/customer/onboarding-call.md`) --
the UI copy and the founder's own explanation should agree, not compete.

## Sync

**"Wow" moment:** the click *is* the analysis. There's no "processing,
check back later" -- a founder can click Connect and have real numbers on
screen within the same breath. This is worth calling out explicitly during
a demo ("that's it, that's the whole setup") because it's a genuine
differentiator most support tooling doesn't have.

## First insight

**"Wow" moment, the strongest one in the product:** `FirstInsightCard`
states a specific number-backed finding, not a generic "your account is
ready" message. In this environment's own seeded story, that's the
password-reset pattern -- a founder can point at the screen and say "we
didn't know to look for that, Sentinel found it." This is the single
moment the whole pilot pitch rests on, and it already works well. No
changes made here in this phase; the copy work in 19E (see
`docs/product/founder-pilot-walkthrough.md`'s messaging notes below) only
touched language, not the moment's structure.

## AI brief

**Point that needs explaining, live:** the "Generate AI Brief" button is
opt-in, not automatic. A founder should say why out loud -- "Sentinel found
this on its own; the AI part is just explaining it in plainer English, and
you don't have to use it." Left as a talking point, not a UI change,
because making it prominent risks implying AI *found* something rather
than explained something already found -- exactly the boundary Phase
18G re-verified as sound.

## Feedback submission

Confirmed working end-to-end: the Feedback button (bottom-right, every
page) and the thumbs up/down on the AI brief both submit successfully and
show a clear confirmation. No friction found here -- this closed the one
real gap identified in Phase 18B's audit (no feedback channel existed
before).

## Messaging found and fixed in this phase (Workstream 19E)

Re-auditing customer-facing copy against "sounds like internal
engineering" turned up four real instances, all fixed:

- Sidebar/mobile sidebar subtitle: "Customer Intelligence Platform" ->
  "Find recurring issues. Improve support." (an outcome, not a category
  label).
- Executive Summary card subtitle: "Rule-based operational briefing" ->
  "A plain-language summary of what matters most right now."
- "deterministic rules" appeared verbatim in four places a customer would
  actually read: Settings' AI trust section, the public Trust Center
  (twice), and the FAQ. Replaced with "the same fixed rules every time" --
  same meaning, no engineering vocabulary.
- "Signal" as a customer-facing noun (Connected Sources: "3 signals
  received"; Operational Signals: "12 signals over 7 days"; a button
  labeled "Save Signal") -- replaced with "items analyzed," "seen 12 times
  over 7 days," and "Save." "Signal" is exactly the kind of internal
  modeling term the Phase 19 handoff calls out by name; a support leader
  would say "tickets" or "times it happened," never "signals."

## Summary

The core loop needs no structural changes -- it already produces a real
"wow" moment (the first insight) without asking the customer to wait or
configure anything. What needed work was entirely language: four small,
surgical copy fixes closed every remaining spot where the product sounded
like it was talking about itself instead of the customer's problem. The two
places still requiring a founder to explain something out loud (source
naming, AI opt-in) are now documented talking points rather than surprises.
