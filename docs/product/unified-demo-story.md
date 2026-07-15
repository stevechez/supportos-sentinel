# Unified Demo Story (Phase 21G)

A 6-step walkthrough for showing a prospect the whole loop -- conversations
in, AI and support operations in the middle, Sentinel's findings out --
in one narrative instead of three separate feature tours. Every screen
named below is real and already built (see
`docs/architecture/unified-customer-operations.md` for what backs each
one); this is a script, not a spec for new UI.

Goal: a prospect stops asking "what is Sentinel?" and instead understands
"this helps my team answer customers, manage support, and continuously
improve" -- within about 5 minutes, per the Phase 21 handoff's success
criteria.

## The story

### 1. Start where the customer starts: a conversation

Open **Conversations** (`/dashboard/conversations`). Point at one real
row -- ideally a password-reset conversation, since that's this org's
running example since Phase 9. Say: "This is a real support conversation.
Sentinel already knows whether the AI handled it, whether it got escalated
to a person, or whether it's still open." Point at the outcome badge.

### 2. Show the operational picture underneath it

Move to **Support Inbox** (`/dashboard/support`). Say: "Zoom out, and this
is the whole queue -- what's open, what got escalated, what people keep
asking about." Point at "Recent questions" and "Recurring issues" --
this is the same password-reset topic starting to repeat.

### 3. Show Sentinel noticing the pattern

Move to **Findings** (`/findings`). Find the finding tied to that same
topic. Say: "Sentinel doesn't guess -- it counted how many times this
exact thing came up and flagged it once it crossed a real threshold."
Open the finding's "Where this came from" detail (Phase 21E) and point at
the actual conversation subjects listed there -- the direct line from
conversation to finding.

### 4. Show what to do about it

Move to **Recommendations** (`/recommendations`). Say: "Every finding
comes with a suggested next step -- in this case, usually 'update this
doc' or 'fix this specific gap.' A person still decides whether to act on
it. Sentinel never changes anything on its own."

### 5. Show the AI boundary directly

Open **How Sentinel's AI works** (`/dashboard/intelligence`, rewritten in
Phase 21B to state this plainly instead of implying a live assistant).
Say: "Everything you just saw came from fixed rules over your own data.
AI only gets used afterward, to explain what the rules already found in
plain language -- never to make the decision itself." This is also where
the resolution-rate numbers (AI handled / escalated / answered from docs)
live if they weren't shown already.

### 6. Zoom back out to the whole picture

Return to **Overview** (`/dashboard`) and point at the Phase 21F
Executive Operations summary at the top: AI handled count, escalations,
patterns detected, recommended improvements, health score -- one line,
five numbers, the entire loop from step 1 through step 5 in one glance.
Close with: "This is the loop -- conversations happen, support operations
track them, Sentinel finds the pattern and explains it, you decide what
to change, and the health score reflects whether it's working."

## What this story deliberately does not do

- Does not claim a live, autonomous "AI assistant" is running --
  Phase 21A's audit found no such system exists, and Phase 21B rewrote the
  one page that implied otherwise.
- Does not demo a reply composer, omnichannel inbox, or real-time chat --
  explicitly out of scope per the Phase 21 handoff.
- Does not show charts or a dashboard tour for its own sake -- the
  Executive Operations summary is deliberately five numbers, not a
  visualization.
- Does not promise auto-resolution or automation the product doesn't have.

## Delivery notes

- Total time target: under 5 minutes if run start to finish without
  detours -- each step above should take under a minute.
- If the prospect has no real pilot data yet, the seeded demo organization
  data (Phase 5.5's demo package) tells the same password-reset story with
  the same six screens.
- If a prospect asks "does the AI reply to customers automatically?", the
  honest answer is: no assistant runs today -- what's demoed is
  Sentinel's analysis of conversations that already happened, and the
  resolution-rate numbers reflect activity already recorded in the
  underlying ticket data. Don't overclaim beyond what step 5 already says.
