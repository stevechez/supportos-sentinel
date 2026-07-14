# Pilot Dashboard (Phase 18I)

## What this is, and why it's a doc and not a page

The handoff asks for internal visibility into pilot users, organizations,
connected sources, first insights, active users, and feedback items, built
from `activity_log`, `organizations`, and `members` -- explicitly avoiding
new analytics infrastructure.

This is deliberately **not a new authenticated page inside the app.** Every
existing page in this codebase is organization-scoped by RLS -- a logged-in
user only ever sees their own organization's data, by design, enforced at
the database level (`user_org_ids()`). A "pilot dashboard" that shows every
pilot organization at once is a fundamentally different kind of view: it
needs to see *across* organizations, which means either a new
service-role-backed admin route with its own authorization model (a real
feature, with real security surface -- exactly the "more infrastructure"
Phase 18 says to avoid), or it means bypassing RLS from inside the
customer-facing app, which CLAUDE.md rules out outright ("never bypass
organization boundaries").

There is no "Sentinel staff" role or admin auth path in this codebase today.
Building one just to have a pilot dashboard page would be scaling
infrastructure before the pilot has even validated the need -- backwards for
a phase whose whole premise is "learn before scaling."

Instead: the same visibility, as SQL, run directly against the project by
whoever is running the pilots (that's a person, not a customer-facing
feature). This costs nothing to build, adds no new attack surface, and is
exactly as fast to check as a dashboard for the handful of organizations a
pilot program actually has.

## The queries

**Organizations (pilot orgs)**

```sql
select id, name, created_at from organizations order by created_at desc;
```

**Pilot users (members per organization)**

```sql
select organization_id, count(*) as member_count
from members
group by organization_id;
```

**Connected sources**

```sql
select organization_id, source_type, status, last_synced_at
from sentinel_connections
order by organization_id;
```

**First insights (activation reached)**

```sql
select organization_id, count(*) as reports, min(created_at) as first_report_at
from sentinel_reports
group by organization_id;
```

**Active users (activity in the last 7 days)**

```sql
select organization_id, count(distinct member_id) as active_members
from activity_log
where created_at > now() - interval '7 days'
group by organization_id;
```

**Feedback items (volume and open triage queue)**

```sql
select organization_id, feedback_type, status, count(*)
from customer_feedback
group by organization_id, feedback_type, status
order by organization_id;
```

**One-shot pilot summary** (all six signals per organization):

```sql
select
  o.id,
  o.name,
  o.created_at as org_created_at,
  (select count(*) from members m where m.organization_id = o.id) as members,
  (select count(*) from sentinel_connections c where c.organization_id = o.id and c.status = 'connected') as connected_sources,
  (select count(*) from sentinel_reports r where r.organization_id = o.id) as reports,
  (select count(distinct member_id) from activity_log a where a.organization_id = o.id and a.created_at > now() - interval '7 days') as active_members_7d,
  (select count(*) from customer_feedback f where f.organization_id = o.id and f.status = 'new') as open_feedback
from organizations o
order by o.created_at desc;
```

## If this needs to become a real page later

If pilot count grows past "a handful of SQL queries is fine," the right
next step is a proper internal admin surface with its own authentication
(not reusing customer login), served outside this Next.js app entirely (a
Retool/Supabase Studio-style internal tool, or a separate admin app) -- not
a route bolted onto the customer product. That's a deliberate decision to
make later, once the pilot has actually validated there's something worth
scaling.
