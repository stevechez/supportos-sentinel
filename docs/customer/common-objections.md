# Common Objections

Real questions a support leader is likely to ask, and how to answer them
honestly -- grounded in what the product actually does, not a sales script
that oversells it.

## "Is this just AI making stuff up?"

No. Every finding, health score, priority, and trend is calculated using
fixed rules -- the same rules every time, not a model generating an
answer. AI is only ever used afterward, to explain a conclusion the rules
already reached, in plain language, and it's opt-in. Point them at the
public Trust Center if they want the full detail in writing.

## "We already kind of know our common issues."

Good -- ask them to name one, then show them what Sentinel actually found.
Two outcomes, both useful: either it confirms what they knew (which is
still worth something -- now it's measured, not just felt), or it shows
something they didn't expect. Don't argue the point; let the first insight
answer it.

## "How is this different from just searching Zendesk?"

Searching answers "did anyone ever ask about X." Sentinel answers "is X
increasing, and did we already try something for it before." That's the
Emerging Risks and Operational Memory features specifically -- pattern
detection over time and a record of what worked, neither of which a manual
search gives you.

## "What happens to our data?"

Organization isolation is enforced at the database level, not just the
app -- another customer's data is never visible to your team, and yours is
never visible to theirs. Your data is only ever used to produce your own
insights, never to train a shared model. Full detail: the Trust Center.

## "What if the AI is wrong?"

The AI never invents a finding, sets a priority, or makes a decision --
it only explains conclusions already reached by fixed rules. If an AI
explanation reads oddly, that's a "was this useful?" thumbs-down away from
being flagged, and the underlying finding is unaffected either way.

## "This seems expensive for what it does."

Ask what specifically feels expensive relative to what -- the honest answer
depends on what a recurring, unaddressed support issue currently costs
them in agent time, which most support leaders haven't actually quantified
before this conversation. Don't argue the price; help them size the cost
of the status quo. See `docs/product/pricing-validation.md` for the
per-tier value proposition to use here.

## "Can my whole team use this?"

Right now, honestly: only the person who signed up has a seat -- there's no
team invite flow yet (a real, acknowledged gap, see
`docs/product/pilot-experience-audit.md`). Don't oversell this. If it's a
blocker for them, that's exactly the kind of thing to write down and bring
back -- it's a strong signal for what to build next, not something to talk
around.

## "What if we want to cancel?"

Be direct: this is a pilot. The goal is to find out together whether it's
worth keeping, not to lock them in.
