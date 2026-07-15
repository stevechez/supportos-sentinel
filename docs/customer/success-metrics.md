# Success Metrics

What "this pilot worked" actually means, so it's evaluated the same way
every time instead of by gut feel.

## The bar, in one sentence

By day 30, the customer has made at least one real change because of
something Sentinel found, and would keep using it if asked to choose today.

## The three checkpoints

### Activated (should happen by day 1-3)

Matches the definition in `docs/product/activation-funnel.md`: signed up,
connected a source, synced, and reached their first insight. Check the
founder dashboard (`/dashboard/founder`) -- "Connected source" and
"Baseline created" both true is the concrete signal.

If this hasn't happened by day 3, the pilot has not started yet in any
meaningful sense, regardless of when they signed up. Reach out.

### Acted on something (should happen by day 7-14)

Not "logged in a few times" -- a specific, describable action: a
documentation edit, a macro change, a process tweak, prompted by a finding
Sentinel surfaced. If unsure whether this happened, ask directly rather
than inferring it from activity_log alone -- "did you change anything
because of what you saw?" is a five-second question that avoids guessing.

### Evaluated (day 30)

Run the interview (`docs/customer/interview-template.md`). The two answers
that matter most:

- **Value:** "What part of this would save your team the most time?" --- a
  concrete answer here is a good sign; "I'm not sure" is not.
- **Buying:** "What would make this worth paying for?" -- listen for
  whether they're describing an actual budget conversation or being polite.

## What does NOT count as success

- Login count alone -- someone can open the dashboard daily without ever
  acting on anything.
- "It's interesting" without a specific action taken.
- A customer who never returned after the first session but didn't
  explicitly say no -- silence is not a positive signal, treat it as churn
  and find out why.

## What to do with a pilot that didn't succeed

Don't just let it quietly end. Ask the "Missing" and "Confusing" interview
questions specifically -- a pilot that didn't convert is often the highest-
value pilot for learning why, more useful to the product roadmap than one
that went smoothly.
