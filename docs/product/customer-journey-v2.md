# Customer Journey v2 — Post-Unification Audit (Phase 22A)

Read-only audit of the path a stranger takes today, after Phase 21 merged
Chat Agent / SupportOS / Sentinel into one navigation (Inbox / Customers /
AI Assistant / Insights / Settings). Phase 17A audited the pre-unification
signup funnel; that audit's findings about signup, org creation, and
onboarding still hold and are not repeated here except where Phase 21
changed them. This document picks up where that one left off: what does the
journey look like now that there's a real Inbox, a real Customers list, and
an AI Assistant that can create tickets on its own.

## The journey, as it exists today

```
Visitor
  -> Marketing homepage (/)
  -> Signup (/signup)
  -> ensureWorkspace(): organization + membership created automatically
  -> /dashboard  (Phase 21F: lean "Customer Operations Home", not the old
                  full-report page)
  -> Zero signals, zero conversations -> onboarding branch on Home
  -> Two parallel first paths, both real (Phase 21):
       (a) "Connect SupportOS" -> signals sync in -> FirstInsightCard
       (b) /dashboard/assistant -> ask a question -> a real ticket +
           conversation is created immediately, no data connection needed
  -> Baseline health report created (path a) -> Insights page fills in
  -> Return visit -> Home shows "What needs attention" + "Recent
     conversations" teasers, linking to Insights / Inbox
```

## What changed since Phase 17A (and is now solid)

- **Home is no longer the full report.** Phase 21F split the old
  everything-on-one-page dashboard into a lean Home (four questions: what's
  happening, what needs attention, what changed, what should I do) and a
  separate Insights page for the full health report. A returning user is not
  re-reading the same wall of numbers every time they log in.
- **There is now a real Inbox and Customers list.** Before Phase 21, tickets
  and customers existed in the schema but had no dedicated UI. A support
  person can now actually see conversations and who they're with, not just
  Sentinel's analysis of them.
- **The AI Assistant is a second, faster path to "first data."** A brand-new
  org with nothing connected can still get a real conversation into the
  system in under a minute by asking the Assistant a question — no source
  connection required.

## Where the friction actually is (new, since unification)

1. **The AI Assistant path does not reliably produce a "first insight."**
   Pattern detection (`src/lib/signals/patterns.ts`) requires
   `MIN_RECURRENCE = 3` — the same question has to recur three times before
   it becomes a surfaced pattern, let alone a finding. A user who asks the
   Assistant one question gets a real, resolved ticket, but Insights will
   still look empty, and nothing on the Assistant page or Home tells them
   that's expected. This is the single biggest gap: the two "first paths"
   from Home don't lead to value at the same speed, and the product doesn't
   say so.
2. **Home's "what needs attention" and "recent conversations" teasers have
   no empty-state guidance distinguishing the two paths.** If a user only
   used the Assistant, Home's onboarding branch still primarily talks about
   connecting a source (per the original Phase 10C/17A copy) — it doesn't
   acknowledge that they've already produced a conversation via the
   Assistant, or explain what would need to happen next (recurrence, or
   connecting a real source) to get an Insight from it.
3. **No terminology collision, but one naming gap.** "Conversation" and
   "ticket" are the same row (a ticket IS the conversation — confirmed in
   `docs/architecture/platform-audit.md`), and the Inbox already renders
   this honestly as a ticket badge on the conversation row. That part is
   fine. What's missing is that the Assistant page never uses the word
   "ticket" at all, so a user who later opens the Inbox and sees a ticket
   labeled `ai_assistant` may not immediately connect it back to the
   question they asked.
4. **Return-visit story is under-tested for the Assistant-only path.** The
   Phase 17A day-0/day-7/day-30 story assumes a connected source generating
   an ongoing stream of signals. A pilot user who only tries the Assistant
   has no equivalent day-7 "did the thing I flagged recur" moment to return
   for, because nothing is tracking recurrence of Assistant-only questions
   against real customer data.
5. **Founder-side visibility of the Assistant path was missing until this
   phase.** `asked_assistant` was not logged to `activity_log` before this
   audit (see Phase 22B), so a founder reviewing the pilot dashboard had no
   way to see that a customer had engaged via the Assistant at all — only
   `connected_source` / `synced_signals` / `created_baseline_report` were
   visible. Fixed as part of this phase (see below).

## Fixes made directly during this audit

Both were small, high-confidence, and directly observed rather than
speculative — fixed on sight per this repo's established practice of
correcting cheap terminology/tracking drift immediately rather than only
logging it as a finding:

- Logged `asked_assistant` to `activity_log` from `askAssistantAction`
  (`src/lib/assistant/actions.ts`), with a new `ActivityAction` variant and
  `describeActivity` case (`src/lib/activity.ts`) — closes finding #5.
- Added a `latestHealthScore` column ("Health") to the founder pilot
  dashboard (`src/lib/founder/data.ts`,
  `src/app/(dashboard)/dashboard/founder/page.tsx`), reusing the existing
  `sentinel_reports.health_score` column — see Phase 22C.
- Fixed stale root metadata (`src/app/layout.tsx`): page title was still
  `'Sentinel'` / `'AI Business Platform'`, inconsistent with the Phase 21
  sidebar rebrand to `'SupportOS'` / `'AI customer operations platform'`.

## What this phase deliberately does not fix

Per the Phase 22 handoff's "do not build ahead of customers" principle, the
remaining findings (1-4 above) are documented, not coded around. In
particular:

- No new UI copy was added to the Assistant page explaining the
  `MIN_RECURRENCE` threshold. Writing that copy without a pilot customer
  ever having asked "why isn't my question showing up as an insight" would
  be guessing at a problem nobody has confirmed exists yet.
- No new "day-7 return" mechanism was built for Assistant-only users. This
  is a real gap, but building a notification or reminder system for it
  would be exactly the kind of ahead-of-customers work this phase is meant
  to avoid.

These are logged here so the next phase (or the next real pilot
conversation) has a concrete, previously-identified starting point instead
of rediscovering them from scratch.

## Revised day-0 / day-7 / day-30 story (two paths, same target)

```
Day 0
  Sign up -> either (a) Connect SupportOS -> first insight in the same
  session, or (b) Ask the AI Assistant -> a real, resolved conversation
  exists immediately, but no insight yet -- that requires either a
  connected source or the same question recurring

Day 7
  Path (a): return to see whether the flagged pattern recurred, and
  whether the fix worked (Operational Memory, Phase 12)
  Path (b): no equivalent moment exists yet -- open gap, not addressed
  this phase

Day 30
  Path (a): health score trend, emerging risks caught early, a track
  record of what got better
  Path (b): only reaches this story once a real source is eventually
  connected, or enough repeat questions accumulate to form a pattern
```

## Summary for Phase 22B (activation metrics)

The existing activation definition (signed_up + synced_signals +
created_baseline_report) still describes real activation — reaching an
actual Insight. The Assistant path produces real customer data and is now
tracked (`asked_assistant`), but is correctly *not* counted as activation on
its own, because it does not reliably produce an insight. Phase 22B treats
`asked_assistant` as a funnel-visibility signal (did this org engage at
all), separate from the activation moment itself.
