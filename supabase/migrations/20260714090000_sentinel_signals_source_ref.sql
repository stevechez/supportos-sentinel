-- Phase 9A: lets a connector (e.g. the SupportOS bridge) upsert signals
-- idempotently instead of re-inserting the same signal on every sync.
-- Nullable because manual entry (Phase 8C) has no natural external
-- reference and doesn't need one.
alter table sentinel_signals add column source_ref text;

create unique index sentinel_signals_org_source_ref_key
  on sentinel_signals (organization_id, source_ref)
  where source_ref is not null;
