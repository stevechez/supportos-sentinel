-- Phase 10A: the provider-agnostic "Data Source Connection" concept.
-- Deliberately not one table per provider (no zendesk_connections,
-- supportos_connections) -- a connection is just "this org turned this
-- provider on," regardless of what the provider is. `provider` reuses the
-- same vocabulary as sentinel_signals.source (Phase 9A) so the two
-- concepts never drift apart.
create table sentinel_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  status text not null default 'connected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, provider)
);

alter table sentinel_connections enable row level security;

create policy "sentinel_connections_select" on "public"."sentinel_connections"
  for select using (organization_id in (select user_org_ids()));

create policy "sentinel_connections_insert" on "public"."sentinel_connections"
  for insert with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_connections_update" on "public"."sentinel_connections"
  for update using (user_has_role(organization_id, 'agent'::member_role))
  with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_connections_delete" on "public"."sentinel_connections"
  for delete using (user_has_role(organization_id, 'agent'::member_role));
