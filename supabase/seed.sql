-- Sentinel demo data.
--
-- sentinel_* tables are organization-scoped (see migration
-- 20260713162834_sentinel_org_scoping_and_rls.sql), so this seed does not
-- insert org-less rows.
--
-- Rather than a handful of unrelated rows, this tells one connected
-- operational story per organization so Phase 5's prioritization, trend,
-- and drill-down features have something real to show:
--
--   finding (password reset failures, 21 days old)
--     -> knowledge gap (no reset documentation exists yet)
--     -> recommendation (publish a reset guide)
--     -> the issue is still open 3 weeks later, and has already survived
--        one Sentinel report cycle
--
-- plus two smaller, newer threads (billing confusion, a silent onboarding
-- failure) so the dashboard has more than one finding to rank, and two
-- historical reports (14 and 7 days ago) so the Trend Detection workstream
-- has real report-to-report deltas to compute instead of a single point.
--
-- Safe to re-run: organizations that already have sentinel_findings rows
-- are skipped entirely.

do $$
declare
  org record;
  finding_password uuid;
  finding_billing uuid;
  finding_onboarding uuid;
begin
  for org in select id from organizations loop

    if exists (
      select 1 from sentinel_findings where organization_id = org.id
    ) then
      continue;
    end if;

    -- Day -21: the long-running password reset issue.
    insert into sentinel_findings
      (organization_id, title, category, severity, description, business_impact,
       confidence_score, source, status, created_at)
    values
      (org.id, 'Repeated password reset failures', 'technical', 'critical',
       'Customers report that password reset emails frequently fail to arrive or expire before use.',
       'Elevated ticket volume and account-access churn.', 92, 'ticket_analysis', 'open',
       now() - interval '21 days')
    returning id into finding_password;

    -- Day -18: the knowledge gap this finding is driving -- no documentation covers it yet.
    insert into sentinel_knowledge_gaps
      (organization_id, question, occurrence_count, confidence_score, recommended_document, status, created_at)
    values
      (org.id, 'How do I reset my password?', 51, 93, null, 'open', now() - interval '18 days');

    -- Day -14: first historical report. The password issue is the dominant driver of a low score.
    insert into sentinel_reports
      (organization_id, title, executive_summary, health_score, report_period_start, report_period_end, created_at)
    values
      (org.id, 'Weekly Customer Operations Health Report',
       'Password reset failures are the primary driver of support volume this period. No documentation exists to help customers self-serve.',
       64, now() - interval '21 days', now() - interval '14 days', now() - interval '14 days');

    -- Day -10: recommendation identified for the password issue.
    insert into sentinel_recommendations
      (organization_id, finding_id, recommendation, expected_impact, priority, status, created_at)
    values
      (org.id, finding_password, 'Publish a password reset guide',
       'Reduce repeat password reset tickets and account-recovery support load.', 'high', 'pending',
       now() - interval '10 days');

    -- Day -9: a second, unrelated finding starts.
    insert into sentinel_findings
      (organization_id, title, category, severity, description, business_impact,
       confidence_score, source, status, created_at)
    values
      (org.id, 'Confusing billing cycle explanations', 'customer_sentiment', 'medium',
       'Customers frequently misunderstand proration and billing cycle timing after plan changes.',
       'Increased billing-related escalations and refund requests.', 81, 'conversation_analysis', 'open',
       now() - interval '9 days')
    returning id into finding_billing;

    -- Day -7: second historical report. Score has improved slightly since a fix plan exists for password reset.
    insert into sentinel_reports
      (organization_id, title, executive_summary, health_score, report_period_start, report_period_end, created_at)
    values
      (org.id, 'Weekly Customer Operations Health Report',
       'A fix plan is in place for password reset failures, though the issue remains open. A new billing communication gap has emerged.',
       71, now() - interval '14 days', now() - interval '7 days', now() - interval '7 days');

    -- Day -6: the billing knowledge gap -- this one already has a documentation fix identified.
    insert into sentinel_knowledge_gaps
      (organization_id, question, occurrence_count, confidence_score, recommended_document, status, created_at)
    values
      (org.id, 'Why was I charged twice?', 19, 80, 'Billing FAQ', 'open', now() - interval '6 days');

    -- Day -5: a third, high-severity finding -- most recent of the three.
    insert into sentinel_findings
      (organization_id, title, category, severity, description, business_impact,
       confidence_score, source, status, created_at)
    values
      (org.id, 'Onboarding checklist steps failing silently', 'technical', 'high',
       'A subset of new customers complete onboarding steps that fail to save, with no error shown.',
       'New customers appear onboarded but are missing required setup, risking early churn.', 88,
       'ticket_analysis', 'open', now() - interval '5 days')
    returning id into finding_onboarding;

    -- Day -4 / -3: recommendations for the two newer findings.
    insert into sentinel_recommendations
      (organization_id, finding_id, recommendation, expected_impact, priority, status, created_at)
    values
      (org.id, finding_billing, 'Update the billing FAQ with proration examples',
       'Reduce billing-related escalations and refund requests.', 'medium', 'pending',
       now() - interval '4 days'),
      (org.id, finding_onboarding, 'Review onboarding workflow error handling',
       'Prevent silent onboarding failures from reaching new customers.', 'high', 'pending',
       now() - interval '3 days');

  end loop;
end $$;
