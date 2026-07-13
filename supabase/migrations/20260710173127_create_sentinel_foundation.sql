create extension if not exists "pgcrypto";

create table sentinel_findings (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  category text not null,

  severity text not null default 'medium',

  description text,

  business_impact text,

  status text not null default 'open',

  confidence_score numeric,

  source text,

  created_at timestamptz default now()
);


create table sentinel_recommendations (
  id uuid primary key default gen_random_uuid(),

  finding_id uuid references sentinel_findings(id)
    on delete cascade,

  recommendation text not null,

  expected_impact text,

  priority text default 'medium',

  status text default 'pending',

  created_at timestamptz default now()
);


create table sentinel_reports (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  executive_summary text,

  health_score numeric,

  report_period_start timestamptz,

  report_period_end timestamptz,

  created_at timestamptz default now()
);


create table sentinel_knowledge_gaps (
  id uuid primary key default gen_random_uuid(),

  question text not null,

  occurrence_count integer default 1,

  confidence_score numeric,

  recommended_document text,

  status text default 'open',

  created_at timestamptz default now()
);
