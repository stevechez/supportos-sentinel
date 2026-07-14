-- Phase 8A: the Operational Signal model.
--
-- Inspected sentinel_findings/sentinel_recommendations/sentinel_reports/
-- sentinel_knowledge_gaps first -- none of them represent an unprocessed
-- piece of incoming operational information; they're all already-analyzed
-- conclusions. This is a genuinely new concept, so one new table, not a
-- reuse of an existing one.
--
-- Deliberately NOT vendor-specific (no "zendesk_tickets" table): `source`
-- is a plain text column ('manual' today, could be 'csv' or an integration
-- name later) so every future ingestion path normalizes into this same
-- shape. `type` is one of a small fixed set (see src/lib/signals/types.ts)
-- but kept as plain text rather than an enum, matching every other
-- sentinel_* status/category column in this schema.
--
-- finding_id is nullable and only set once a human has turned a detected
-- pattern of signals into a real finding (Phase 8D) -- it's the signal's
-- link back into the existing analysis engine, not a new workflow state
-- machine.

create table sentinel_signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,

  type text not null,
  source text not null default 'manual',

  title text not null,
  content text,

  severity text,

  finding_id uuid references sentinel_findings(id) on delete set null,

  created_at timestamptz not null default now()
);

alter table sentinel_signals enable row level security;

create policy "sentinel_signals_select" on "public"."sentinel_signals"
	for select
	using (organization_id in (select user_org_ids()));

create policy "sentinel_signals_insert" on "public"."sentinel_signals"
	for insert
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_signals_update" on "public"."sentinel_signals"
	for update
	using (user_has_role(organization_id, 'agent'::member_role))
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_signals_delete" on "public"."sentinel_signals"
	for delete
	using (user_has_role(organization_id, 'agent'::member_role));
