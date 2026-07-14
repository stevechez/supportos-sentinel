-- Phase 7A/7B: finding and recommendation lifecycle tracking.
--
-- Deliberately minimal. sentinel_findings.status and
-- sentinel_recommendations.status are already plain, unconstrained text
-- columns (no CHECK constraint, no enum) -- they already support the new
-- lifecycle values ('acknowledged', 'in_progress', 'resolved' /
-- 'in_progress', 'completed') with zero schema change. This migration only
-- adds the two audit columns each table is missing: when an item was
-- resolved/completed, and which member did it. No new tables.
--
-- Existing RLS policies (sentinel_findings_update / sentinel_recommendations_update,
-- from 20260713162834_sentinel_org_scoping_and_rls.sql) already cover these
-- new columns -- Postgres RLS policies apply to the whole row, not specific
-- columns, so no new policy is needed here.

alter table sentinel_findings
  add column resolved_at timestamptz,
  add column resolved_by uuid references members(id) on delete set null;

alter table sentinel_recommendations
  add column completed_at timestamptz,
  add column completed_by uuid references members(id) on delete set null;
