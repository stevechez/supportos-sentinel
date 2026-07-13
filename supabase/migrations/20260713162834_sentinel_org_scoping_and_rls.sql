-- Sentinel tables (sentinel_findings, sentinel_recommendations,
-- sentinel_reports, sentinel_knowledge_gaps) were created with RLS
-- enabled but no policies, and no organization_id column -- meaning
-- they were both inaccessible to anon/authenticated (RLS-enabled +
-- no policy = deny-all for non-service-role) and not org-scoped like
-- every other table in the schema.
--
-- This brings them in line with the rest of the platform's
-- organization-based data ownership model: add organization_id, and
-- add the same policy shape already used on tickets/knowledge_documents
-- (SELECT for any org member via user_org_ids(), writes gated on
-- user_has_role() at the 'agent' level). All four tables are empty in
-- production, so backfilling isn't a concern here.

alter table "public"."sentinel_findings"
	add column "organization_id" uuid not null references "public"."organizations"("id") on delete cascade;

alter table "public"."sentinel_recommendations"
	add column "organization_id" uuid not null references "public"."organizations"("id") on delete cascade;

alter table "public"."sentinel_reports"
	add column "organization_id" uuid not null references "public"."organizations"("id") on delete cascade;

alter table "public"."sentinel_knowledge_gaps"
	add column "organization_id" uuid not null references "public"."organizations"("id") on delete cascade;

-- sentinel_findings

create policy "sentinel_findings_select" on "public"."sentinel_findings"
	for select
	using (organization_id in (select user_org_ids()));

create policy "sentinel_findings_insert" on "public"."sentinel_findings"
	for insert
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_findings_update" on "public"."sentinel_findings"
	for update
	using (user_has_role(organization_id, 'agent'::member_role))
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_findings_delete" on "public"."sentinel_findings"
	for delete
	using (user_has_role(organization_id, 'agent'::member_role));

-- sentinel_recommendations

create policy "sentinel_recommendations_select" on "public"."sentinel_recommendations"
	for select
	using (organization_id in (select user_org_ids()));

create policy "sentinel_recommendations_insert" on "public"."sentinel_recommendations"
	for insert
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_recommendations_update" on "public"."sentinel_recommendations"
	for update
	using (user_has_role(organization_id, 'agent'::member_role))
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_recommendations_delete" on "public"."sentinel_recommendations"
	for delete
	using (user_has_role(organization_id, 'agent'::member_role));

-- sentinel_reports

create policy "sentinel_reports_select" on "public"."sentinel_reports"
	for select
	using (organization_id in (select user_org_ids()));

create policy "sentinel_reports_insert" on "public"."sentinel_reports"
	for insert
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_reports_update" on "public"."sentinel_reports"
	for update
	using (user_has_role(organization_id, 'agent'::member_role))
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_reports_delete" on "public"."sentinel_reports"
	for delete
	using (user_has_role(organization_id, 'agent'::member_role));

-- sentinel_knowledge_gaps

create policy "sentinel_knowledge_gaps_select" on "public"."sentinel_knowledge_gaps"
	for select
	using (organization_id in (select user_org_ids()));

create policy "sentinel_knowledge_gaps_insert" on "public"."sentinel_knowledge_gaps"
	for insert
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_knowledge_gaps_update" on "public"."sentinel_knowledge_gaps"
	for update
	using (user_has_role(organization_id, 'agent'::member_role))
	with check (user_has_role(organization_id, 'agent'::member_role));

create policy "sentinel_knowledge_gaps_delete" on "public"."sentinel_knowledge_gaps"
	for delete
	using (user_has_role(organization_id, 'agent'::member_role));
