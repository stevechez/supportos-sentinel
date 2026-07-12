-- Enable Row Level Security for Sentinel tables

alter table public.sentinel_findings
enable row level security;

alter table public.sentinel_recommendations
enable row level security;

alter table public.sentinel_reports
enable row level security;

alter table public.sentinel_knowledge_gaps
enable row level security;