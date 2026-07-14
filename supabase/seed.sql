-- Sentinel demo data.
--
-- sentinel_* tables are organization-scoped (see migration
-- 20260713162834_sentinel_org_scoping_and_rls.sql), so this seed does not
-- insert org-less rows.
--
-- Rather than a handful of unrelated rows, this tells one connected
-- operational story per organization, now running the full Phase 7
-- improvement loop end to end:
--
--   finding (password reset failures, 21 days old)
--     -> knowledge gap (no reset documentation exists yet)
--     -> recommendation (publish a reset guide) -- completed 4 days ago
--     -> finding resolved 3 days ago
--     -> health score measurably improves (Recent Improvements card,
--        Executive Timeline)
--
-- plus two smaller, newer threads (billing confusion, a silent onboarding
-- failure) that are still active, so the dashboard has open work to show
-- alongside the completed story, and two historical reports (14 and 7 days
-- ago) so Trend Detection has real report-to-report deltas.
--
-- Safe to re-run: organizations that already have sentinel_findings rows
-- are skipped entirely.

do $$
declare
  org record;
  member_id uuid;
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

    select id into member_id from members where organization_id = org.id limit 1;

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

    -- Day -4: the password reset guide gets published -- Phase 7's improvement
    -- loop closes the recommendation.
    update sentinel_recommendations
      set status = 'completed', completed_at = now() - interval '4 days', completed_by = member_id
      where organization_id = org.id and finding_id = finding_password;

    -- Day -3: with the guide live and reset failures confirmed fixed, the
    -- finding itself is resolved.
    update sentinel_findings
      set status = 'resolved', resolved_at = now() - interval '3 days', resolved_by = member_id
      where id = finding_password;

  end loop;
end $$;

-- Phase 9: the SupportOS -> Sentinel connector demo.
--
-- The password reset finding above was resolved days ago. These two new
-- tickets tell the next chapter of the same story: the issue is
-- resurfacing in real SupportOS ticket data, which is exactly what the
-- Phase 9B connector (src/lib/signals/adapters/supportos.ts) is meant to
-- notice on its first sync -- three tickets with the same subject line is
-- enough for Phase 8's deterministic pattern detector to flag a
-- recurrence, without any change to that detection code.
--
-- Only runs for organizations that already have real SupportOS ticket
-- data (the `tickets` table is Connect/Support-owned, not Sentinel's --
-- this seed does not create ticket data for an org that has none) and
-- haven't already been seeded with the follow-up tickets.
do $$
declare
  org record;
begin
  for org in select id from organizations loop

    if not exists (select 1 from tickets where organization_id = org.id) then
      continue;
    end if;

    if (
      select count(*) from tickets
      where organization_id = org.id and subject = 'Can''t reset my password'
    ) >= 3 then
      continue;
    end if;

    insert into tickets (organization_id, subject, status, priority, tags, ai_resolved, channel, created_at)
    values
      (org.id, 'Can''t reset my password', 'open', 'medium', array['technical'], false, 'email', now() - interval '2 days'),
      (org.id, 'Can''t reset my password', 'open', 'medium', array['technical'], false, 'web', now() - interval '4 hours');

  end loop;
end $$;

-- Phase 14: backfill for the trend acceleration engine.
--
-- Phase 8's manually-logged signals ("Customer couldnt reset password" and
-- similar) all landed within minutes of each other, which is realistic for
-- a demo but leaves nothing for src/lib/signals/trends.ts to compare --
-- period-over-period growth needs signals spread across actual weeks, not
-- a burst on one day. This backfills the same operational theme (password
-- reset) across the last three weekly periods with a genuine accelerating
-- shape (2 -> 3 -> current) so Phase 14's Emerging Risks card has a real
-- trend to detect rather than a fabricated one -- these are ordinary
-- ticket signals, not a pre-computed trend or finding.
--
-- Only runs for organizations that already have at least one manually
-- logged password-reset signal (Phase 8's seed target) and haven't already
-- received this backfill.
do $$
declare
  org record;
begin
  for org in select id from organizations loop

    if not exists (
      select 1 from sentinel_signals
      where organization_id = org.id and type = 'ticket' and title ilike '%password%'
    ) then
      continue;
    end if;

    if exists (
      select 1 from sentinel_signals
      where organization_id = org.id and title = 'password reset link expired'
    ) then
      continue;
    end if;

    insert into sentinel_signals (organization_id, type, source, title, content, severity, created_at)
    values
      (org.id, 'ticket', 'manual', 'customer cannot reset password', null, null, now() - interval '19 days'),
      (org.id, 'ticket', 'manual', 'password reset link not working', null, null, now() - interval '17 days'),
      (org.id, 'ticket', 'manual', 'customer locked out after password reset', null, null, now() - interval '11 days'),
      (org.id, 'ticket', 'manual', 'password reset email never arrived', null, null, now() - interval '10 days'),
      (org.id, 'ticket', 'manual', 'customer forgot password again', null, null, now() - interval '9 days'),
      (org.id, 'ticket', 'manual', 'password reset confusion', null, null, now() - interval '8 days'),
      (org.id, 'ticket', 'manual', 'password reset link expired', null, null, now() - interval '3 days'),
      (org.id, 'ticket', 'manual', 'customer cannot complete password reset', null, null, now() - interval '2 days'),
      (org.id, 'ticket', 'manual', 'password reset instructions unclear', null, null, now() - interval '1 days'),
      (org.id, 'ticket', 'manual', 'another password reset failure', null, null, now() - interval '12 hours');

  end loop;
end $$;
