insert into sentinel_reports (
  title,
  executive_summary,
  health_score,
  report_period_start,
  report_period_end
)
values (
  'Weekly Customer Operations Health Report',
  'Customer satisfaction is stable, but billing confusion and checkout friction require attention.',
  82,
  now() - interval '7 days',
  now()
);


insert into sentinel_findings (
  title,
  category,
  severity,
  description,
  business_impact,
  confidence_score,
  source
)
values
(
  'Checkout payment failures increased 42%',
  'technical',
  'critical',
  'Multiple customers reported payment failures after the latest deployment.',
  'Potential lost revenue and abandoned purchases.',
  94,
  'ticket_analysis'
),
(
  'Customers cannot find cancellation policy',
  'knowledge_gap',
  'medium',
  'Repeated questions indicate missing documentation.',
  'Higher support volume and lower customer confidence.',
  89,
  'chat_analysis'
),
(
  'Refund requests increasing after product update',
  'customer_sentiment',
  'high',
  'Negative sentiment increased following the latest release.',
  'Potential churn risk.',
  86,
  'conversation_analysis'
);


insert into sentinel_knowledge_gaps (
  question,
  occurrence_count,
  confidence_score,
  recommended_document
)
values
(
  'How do I cancel my subscription?',
  37,
  96,
  'Cancellation Policy FAQ'
),
(
  'Do you support enterprise SSO?',
  22,
  91,
  'Enterprise Features Documentation'
);


insert into sentinel_recommendations (
  finding_id,
  recommendation,
  expected_impact,
  priority
)
select
  id,
  'Create a dedicated FAQ article addressing the customer confusion.',
  'Reduce repetitive support requests.',
  'high'
from sentinel_findings
where category = 'knowledge_gap';
