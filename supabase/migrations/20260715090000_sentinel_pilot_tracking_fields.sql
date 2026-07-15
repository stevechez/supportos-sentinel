-- Phase 20B -- pilot customer tracking. "Just enough structure," not a
-- CRM: four columns on the table that already represents a pilot customer
-- (organizations), rather than a new pilot-tracking table duplicating what
-- organizations already models. Everything else the handoff asks to track
-- (connected source, first insight date, last activity, feedback count) is
-- already derivable from existing tables (sentinel_connections,
-- sentinel_reports, activity_log, customer_feedback) -- see
-- src/lib/founder/data.ts, extended in this same phase.
alter table public.organizations
	add column if not exists pilot_status text not null default 'invited'
		check (pilot_status in ('invited', 'onboarding', 'active', 'reviewing', 'converted', 'paused')),
	add column if not exists pilot_started_at timestamptz,
	add column if not exists primary_contact_name text,
	add column if not exists primary_contact_email text;
