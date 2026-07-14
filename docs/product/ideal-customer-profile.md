# Ideal Customer Profile (Phase 18A)

Sentinel's first pilots are not "anyone with a support team." A specific,
narrow profile, chosen so learning from the first few pilots actually
generalizes to the next ones.

## Company type

B2B SaaS companies, 20-200 employees. Small enough that support leadership
still personally reads a meaningful share of tickets (so they can sanity-check
what Sentinel finds against their own memory of the last few weeks); large
enough that the same question is genuinely being asked by more than one
customer, which is the entire premise of pattern detection.

Not targeting: consumer apps (support volume and question variety are too
different), companies under ~20 people (support volume too low for patterns
to be statistically meaningful within weeks), and enterprises (procurement
cycle and security review requirements don't match a "learn fast" pilot).

## Team size

5-20 support agents. Small enough that no one already has a dedicated
analyst turning ticket data into reports by hand; large enough that "the
same question keeps coming up" is a real, felt problem rather than something
one person just remembers.

## Current tools

Already using a ticketing system with a real API: Intercom, Zendesk, or
Freshdesk. This matters concretely, not just as a checkbox -- Sentinel's
SupportOS connector (Phase 9) is the only real ingestion path today, so the
ICP needs ticket data that actually looks like the `tickets`/`messages`
schema Sentinel already reads (subject, status, timestamps, resolution
path). A pilot customer on a tool with no clean export would be testing
"can we build a new connector," not "does Sentinel provide value" -- the
wrong question for Phase 18.

## Pain points

- Repeated customer questions the team can feel but can't quantify ("it
  feels like everyone's asking about X this month, but I couldn't tell you
  the actual number").
- Poor visibility into support trends between the weekly stand-up and the
  quarterly report -- nothing in between.
- Documentation gaps that only become visible after enough customers hit
  the same wall, by which point it's already cost real support time.
- No consistent record of what was tried before for a given recurring
  issue, or whether it worked.

## Buying trigger

A specific, recent moment of frustration, not a general "we should probably
get better tooling" feeling. Concretely: a support lead just spent real time
(an afternoon, a stand-up) manually digging through tickets to answer
"is this actually happening more, or does it just feel that way?" -- and
either couldn't get a confident answer, or got one but it took too long to
be useful. That specific moment is what Sentinel's first-insight experience
(Phase 10D) needs to land squarely on.

## Success criteria

The pilot customer should, in their own words, be able to say:

- "I found out about a pattern I didn't already know about." (Not
  something they could've gotten from a five-minute Zendesk search --
  something that took Sentinel to see.)
- "I made one real change because of it." (A documentation edit, a macro,
  a process tweak -- not just "interesting, noted.")
- "I'd rather have this than not." Not "I'd pay any price" -- just that,
  given the option to keep it or drop it at the end of the pilot, they'd
  keep it.

If a pilot customer can't say the first one within their first session,
Phase 18B (pilot experience audit) and Phase 18H (customer interviews) are
where that gets diagnosed.
