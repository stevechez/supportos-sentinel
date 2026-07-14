# Customer Journey — SaaS Launch Readiness (Phase 17A)

Read-only audit of the path a stranger takes from "never heard of Sentinel" to
"paying customer," as it actually exists in this repo today (not the aspirational
version). Written before any Phase 17 code changes, to ground what gets built.

## The journey, as it exists

```
Visitor
  -> Marketing homepage (/)
  -> Signup (/signup)
  -> [Supabase auth.signUp — org NOT created yet]
  -> Email confirmation ("Check your email")
  -> First login (/login)
  -> ensureWorkspace(): organization + membership created automatically
  -> Stripe Checkout (only if STRIPE_PRICE_ID is configured; otherwise skipped)
  -> /dashboard
  -> Zero signals, zero reports -> OnboardingBanner + ConnectedSourcesCard
  -> "Connect SupportOS" (one click, Phase 10A) -> signals sync in
  -> FirstInsightCard (Phase 10D) — first thing the user actually understands
  -> Baseline health report created -> full dashboard hierarchy (Phase 13A)
```

## What already works well (do not rebuild)

- **Signup -> organization is already collapsed into one step.** The user never
  sees a separate "create your organization" screen — `ensureWorkspace()` in
  `packages/auth/actions/auth.ts` creates the org and membership automatically
  from the business name collected at signup, on the first real session
  (immediately if email confirmation is off, on first login if it's on). This
  already matches the "desired flow" in the Phase 17C brief.
- **The empty-dashboard problem is already solved.** A brand-new org
  (zero signals, zero reports) gets `OnboardingBanner` — a single "Connect
  SupportOS" button — instead of a wall of zeroes (Phase 10C).
- **Time-to-first-value is already short.** Connecting is syncing: one click
  turns "nothing" into signals, and `FirstInsightCard` (Phase 10D) surfaces
  the first pattern Sentinel finds before a full baseline report exists.
- **Billing degrades gracefully.** If `STRIPE_PRICE_ID` isn't set, signup
  doesn't dead-end — the user lands directly in the product and can subscribe
  later from `/pricing`.

## Where the friction actually is

1. **The homepage doesn't say what Sentinel is for.** The hero reads "AI that
   just works for your business" / eyebrow "Sentinel AI Platform" — this is
   technology-first framing, the exact thing Phase 17's guiding principle
   ("sell the outcome, not the technology") warns against. A stranger cannot
   tell in 10 seconds that this is a support-operations product. There's no
   dedicated "Problem" section naming the pain (repeated questions, hidden
   documentation gaps, unresolved patterns) before the "How it works" section.
2. **Trust content exists but is invisible to a stranger.** `TrustSection`
   (`src/app/(marketing)/trust-section.tsx`) is a fully-built component that
   is never imported anywhere — dead code. Separately, real AI-boundary trust
   copy ("AI does not make operational decisions") was written for the
   in-app Settings page in Phase 16D, but that's behind login. A visitor
   deciding whether to connect their data has nowhere public to read it.
3. **Pricing is a single flat plan with no framing.** `$149/month` with no
   named tiers gives a stranger nothing to size themselves against ("is this
   for me, a 3-person team, or a 300-person team?"). Phase 17D asks for
   placeholder tiers, which is enough to fix this without touching the real
   Stripe integration (only one `STRIPE_PRICE_ID` exists; that's fine to keep).
4. **The demo page shows stats, not a story.** `/demo` (built in Phase 16G)
   shows illustrative numbers (142 conversations, 3 emerging risks) but never
   walks through the actual product loop — problem noticed, finding created,
   fix made, outcome measured. A stranger sees dashboard-shaped noise, not
   the value loop.
5. **No public FAQ or setup guide for the specific, obvious questions.**
   "What happens if sync fails?" "What happens if AI is unavailable?" "How
   do I connect my data?" — none of these are answered anywhere public. The
   `/resources` guides explain product concepts but not operational reliability.
6. **No funnel instrumentation at all.** There is no record of how many
   visitors sign up, connect a source, or reach a first insight. The
   `activity_log` table (Phase 16A) already records in-product events but
   nothing marks the signup moment itself, and nothing is measured in aggregate.

## Terminology check

No renames needed here — Phase 13C already did a full nav/terminology pass.
The one addition: the words "connect a source" and "sync" are used
interchangeably across onboarding copy (banner says "Connect SupportOS," the
button that fires the same action elsewhere says "Sync Now"). Left as-is —
both are accurate to what's happening and a stranger encounters only one of
them at a time.

## Revised day-0 / day-7 / day-30 story (target, for marketing copy)

```
Day 0
  Sign up -> Connect SupportOS -> First insight in the same session

Day 7
  Return to see whether the pattern Sentinel flagged actually recurred,
  and whether the fix they made worked (Operational Memory, Phase 12)

Day 30
  See operational progress: health score trend, emerging risks caught early,
  a track record of what got better because of the fix they made
```

## What Phase 17 will change, based on this audit

- Rewrite the homepage Hero + add a Problem section (17B) — outcome language,
  no "AI platform" framing.
- Wire `TrustSection` into a real, public `/trust` page reusing the AI-boundary
  language already proven in Settings (17F).
- Add placeholder pricing tiers to `PricingSection` without touching the real
  single-price Stripe checkout flow (17D).
- Rewrite `/demo` around the actual value loop, not just numbers (17E).
- Add a public FAQ answering the reliability questions above (17G).
- Log a `signed_up` activity event and document the funnel definition against
  events that already exist (17H) — no new analytics vendor, no new platform.
- No changes to the signup/org-creation/first-login code path itself — it
  already matches the desired flow and isn't the source of friction.
