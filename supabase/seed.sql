-- Sentinel demo data.
--
-- sentinel_* tables are organization-scoped (see migration
-- 20260713162834_sentinel_org_scoping_and_rls.sql), so this seed no longer
-- inserts org-less rows -- the old version of this file predates that
-- migration and would now fail its NOT NULL organization_id constraint.
--
-- Instead it loops over every existing organization and, if that
-- organization has no Sentinel data yet, gives it a small, realistic set of
-- findings, recommendations, a couple of knowledge gaps, and one historical
-- report. Safe to re-run: organizations that already have sentinel_findings
-- rows are skipped.

do $$
declare
  org record;
  finding_checkout uuid;
  finding_refunds uuid;
  finding_cancellation uuid;
begin
  for org in select id from organizations loop

    if exists (
      select 1 from sentinel_findings where organization_id = org.id
    ) then
      continue;
    end if;

    insert into sentinel_findings
      (organization_id, title, category, severity, description, business_impact, confidence_score, source, status)
    values
      (org.id, 'Checkout payment failures increased 42%', 'technical', 'critical',
       'Multiple customers reported payment failures after the latest deployment.',
       'Potential lost revenue and abandoned purchases.', 94, 'ticket_analysis', 'open')
    returning id into finding_checkout;

    insert into sentinel_findings
      (organization_id, title, category, severity, description, business_impact, confidence_score, source, status)
    values
      (org.id, 'Refund requests increasing after product update', 'customer_sentiment', 'high',
       'Negative sentiment increased following the latest release.',
       'Elevated churn risk following the release.', 86, 'conversation_analysis', 'open')
    returning id into finding_refunds;

    insert into sentinel_findings
      (organization_id, title, category, severity, description, business_impact, confidence_score, source, status)
    values
      (org.id, 'Customers cannot find cancellation policy', 'knowledge_gap', 'medium',
       'Repeated questions indicate missing documentation.',
       'Higher support volume and lower customer confidence.', 89, 'chat_analysis', 'open')
    returning id into finding_cancellation;

    insert into sentinel_recommendations
      (organization_id, finding_id, recommendation, expected_impact, priority, status)
    values
      (org.id, finding_checkout, 'Investigate and fix the checkout payment gateway integration',
       'Recover lost revenue and reduce cart abandonment.', 'high', 'pending'),
      (org.id, finding_cancellation, 'Publish a cancellation policy FAQ article',
       'Reduce repetitive support requests about cancellations.', 'medium', 'pending'),
      (org.id, finding_refunds, 'Review refund workflow communication templates',
       'Improve customer sentiment following refunds.', 'medium', 'pending');

    insert into sentinel_knowledge_gaps
      (organization_id, question, occurrence_count, confidence_score, recommended_document, status)
    values
      (org.id, 'How do I cancel my subscription?', 37, 96, 'Cancellation Policy FAQ', 'open'),
      (org.id, 'Do you support enterprise SSO?', 22, 91, 'Enterprise Features Documentation', 'open');

    insert into sentinel_reports
      (organization_id, title, executive_summary, health_score, report_period_start, report_period_end)
    values
      (org.id, 'Weekly Customer Operations Health Report',
       'Customer satisfaction is stable, but billing confusion and checkout friction require attention.',
       86, now() - interval '7 days', now() - interval '1 hour');

  end loop;
end $$;
