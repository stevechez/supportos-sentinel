-- Phase 18D/E -- lightweight customer feedback capture. Not a feedback
-- SaaS: one table, four fixed categories, three status values. Reuses the
-- same organization/member/RLS pattern as activity_log (Phase 16A) and
-- every sentinel_* table before it.
create table if not exists public.customer_feedback (
	id uuid primary key default gen_random_uuid(),
	organization_id uuid not null references public.organizations(id) on delete cascade,
	member_id uuid references public.members(id) on delete set null,
	feedback_type text not null check (feedback_type in ('confusion', 'missing_capability', 'bug', 'value')),
	message text not null,
	context text,
	priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
	status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
	created_at timestamptz not null default now()
);

create index if not exists customer_feedback_org_idx on public.customer_feedback (organization_id, created_at desc);

alter table public.customer_feedback enable row level security;

-- Any member of the org (down to viewer) can submit feedback -- feedback
-- quality matters more than gatekeeping who can give it.
create policy customer_feedback_insert on public.customer_feedback
	for insert
	with check (user_has_role(organization_id, 'viewer'::member_role));

create policy customer_feedback_select on public.customer_feedback
	for select
	using (organization_id in (select user_org_ids()));

-- Triage (status/priority changes) requires admin, matching every other
-- moderation-style action in this schema (member management, settings).
create policy customer_feedback_update on public.customer_feedback
	for update
	using (user_has_role(organization_id, 'admin'::member_role));

create policy customer_feedback_delete on public.customer_feedback
	for delete
	using (user_has_role(organization_id, 'admin'::member_role));
