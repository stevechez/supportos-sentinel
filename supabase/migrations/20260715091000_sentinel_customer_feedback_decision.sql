-- Phase 20D -- turning feedback into decisions. The customer-facing
-- capture surfaces (Phase 18D/E) stay exactly as they are -- a customer
-- still just picks a category and writes a message. These two columns are
-- founder-side triage fields, set after reading feedback, not collected
-- from the customer. decision is nullable (most feedback starts
-- undecided) and closed to the five categories the handoff names.
alter table public.customer_feedback
	add column if not exists decision text
		check (decision in ('build', 'fix', 'document', 'ignore', 'investigate')),
	add column if not exists decision_notes text;
