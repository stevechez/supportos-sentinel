


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."member_role" AS ENUM (
    'owner',
    'admin',
    'agent',
    'viewer'
);


ALTER TYPE "public"."member_role" OWNER TO "postgres";


CREATE TYPE "public"."message_sender" AS ENUM (
    'customer',
    'agent',
    'ai',
    'system'
);


ALTER TYPE "public"."message_sender" OWNER TO "postgres";


CREATE TYPE "public"."sentiment" AS ENUM (
    'positive',
    'neutral',
    'negative'
);


ALTER TYPE "public"."sentiment" OWNER TO "postgres";


CREATE TYPE "public"."ticket_priority" AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE "public"."ticket_priority" OWNER TO "postgres";


CREATE TYPE "public"."ticket_status" AS ENUM (
    'open',
    'waiting',
    'resolved',
    'closed'
);


ALTER TYPE "public"."ticket_status" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "run_after" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_jobs"("p_limit" integer DEFAULT 5) RETURNS SETOF "public"."jobs"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with due as (
    select id from jobs
    where (status = 'pending' and run_after <= now())
       or (status = 'running' and updated_at < now() - interval '5 minutes')
    order by run_after
    limit p_limit
    for update skip locked
  )
  update jobs
  set status = 'running', attempts = attempts + 1, updated_at = now()
  where id in (select id from due)
  returning *;
$$;


ALTER FUNCTION "public"."claim_jobs"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_workspace"("p_name" "text", "p_slug" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  new_org uuid;
  user_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select email into user_email from auth.users where id = auth.uid();

  insert into organizations (name, slug)
  values (p_name, p_slug)
  returning id into new_org;

  insert into members (organization_id, user_id, role, display_name)
  values (new_org, auth.uid(), 'owner', split_part(coalesce(user_email, 'owner'), '@', 1));

  insert into activity_log (organization_id, actor_type, action, metadata)
  values (new_org, 'system', 'workspace.created', '{}'::jsonb);

  return new_org;
end $$;


ALTER FUNCTION "public"."create_workspace"("p_name" "text", "p_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_usage"("p_org" "uuid", "p_key" "text") RETURNS integer
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  insert into usage_counters (organization_id, period, key, count)
  values (p_org, to_char(now(), 'YYYY-MM'), p_key, 1)
  on conflict (organization_id, period, key)
  do update set count = usage_counters.count + 1, updated_at = now()
  returning count;
$$;


ALTER FUNCTION "public"."increment_usage"("p_org" "uuid", "p_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_customer_visible_documents"("p_org_id" "uuid") RETURNS TABLE("id" "uuid", "title" "text", "tags" "text"[])
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select kd.id, kd.title, kd.tags
  from knowledge_documents kd
  where kd.organization_id = p_org_id
    and kd.customer_visible = true
    and kd.status = 'ready'
  order by kd.title asc;
$$;


ALTER FUNCTION "public"."list_customer_visible_documents"("p_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_knowledge_chunks"("query_embedding" "public"."vector", "match_count" integer DEFAULT 5, "min_similarity" double precision DEFAULT 0.2) RETURNS TABLE("chunk_id" "uuid", "document_id" "uuid", "document_title" "text", "content" "text", "chunk_index" integer, "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    kc.id as chunk_id,
    kc.document_id,
    kd.title as document_title,
    kc.content,
    kc.chunk_index,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_documents kd on kd.id = kc.document_id
  where kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) >= min_similarity
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_knowledge_chunks"("query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_knowledge_chunks_for_org"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer DEFAULT 5, "min_similarity" double precision DEFAULT 0.2) RETURNS TABLE("chunk_id" "uuid", "document_id" "uuid", "document_title" "text", "content" "text", "chunk_index" integer, "similarity" double precision)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    kc.id as chunk_id,
    kc.document_id,
    kd.title as document_title,
    kc.content,
    kc.chunk_index,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_documents kd on kd.id = kc.document_id
  where kc.organization_id = p_org_id
    and kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) >= min_similarity
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_knowledge_chunks_for_org"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_knowledge_chunks_public"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer DEFAULT 5, "min_similarity" double precision DEFAULT 0.2) RETURNS TABLE("chunk_id" "uuid", "document_id" "uuid", "document_title" "text", "content" "text", "chunk_index" integer, "similarity" double precision)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    kc.id as chunk_id,
    kc.document_id,
    kd.title as document_title,
    kc.content,
    kc.chunk_index,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_documents kd on kd.id = kc.document_id
  where kc.organization_id = p_org_id
    and kd.customer_visible = true
    and kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) >= min_similarity
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_knowledge_chunks_public"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rate_limit_gc"() RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  delete from rate_limits where window_start < now() - interval '1 hour';
$$;


ALTER FUNCTION "public"."rate_limit_gc"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rate_limit_hit"("p_bucket" "text", "p_window_seconds" integer) RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  insert into rate_limits (bucket, window_start, count)
  values (
    p_bucket,
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds),
    1
  )
  on conflict (bucket, window_start)
  do update set count = rate_limits.count + 1
  returning count;
$$;


ALTER FUNCTION "public"."rate_limit_hit"("p_bucket" "text", "p_window_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."redeem_invitation"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  user_email text;
  inv record;
begin
  select email into user_email from auth.users where id = auth.uid();
  if user_email is null then
    return null;
  end if;

  select * into inv
  from invitations
  where lower(email) = lower(user_email) and accepted_at is null
  order by created_at desc
  limit 1;

  if inv.id is null then
    return null;
  end if;

  insert into members (organization_id, user_id, role, display_name)
  values (inv.organization_id, auth.uid(), inv.role, split_part(user_email, '@', 1))
  on conflict (organization_id, user_id) do nothing;

  update invitations set accepted_at = now() where id = inv.id;

  insert into activity_log (organization_id, actor_type, action, metadata)
  values (inv.organization_id, 'system', 'member.joined', jsonb_build_object('email', user_email, 'role', inv.role));

  return inv.organization_id;
end $$;


ALTER FUNCTION "public"."redeem_invitation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end $$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_role"("p_org" "uuid", "p_min" "public"."member_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from members
    where organization_id = p_org
      and user_id = auth.uid()
      and (case role
             when 'viewer' then 0
             when 'agent'  then 1
             when 'admin'  then 2
             when 'owner'  then 3
           end)
          >=
          (case p_min
             when 'viewer' then 0
             when 'agent'  then 1
             when 'admin'  then 2
             when 'owner'  then 3
           end)
  );
$$;


ALTER FUNCTION "public"."user_has_role"("p_org" "uuid", "p_min" "public"."member_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_org_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select organization_id from members where user_id = auth.uid()
$$;


ALTER FUNCTION "public"."user_org_ids"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."action_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "action_type" "text" NOT NULL,
    "params" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "reasoning" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "delivery_response" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "action_requests_action_type_check" CHECK (("action_type" = ANY (ARRAY['refund'::"text", 'cancel_order'::"text", 'update_shipping_address'::"text"]))),
    CONSTRAINT "action_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'sent'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."action_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "actor_type" "text" DEFAULT 'member'::"text" NOT NULL,
    "member_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "system_prompt" "text" DEFAULT ''::"text" NOT NULL,
    "model" "text" DEFAULT 'claude-sonnet-4-5'::"text" NOT NULL,
    "temperature" numeric(3,2) DEFAULT 0.7 NOT NULL,
    "allowed_actions" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_experiments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "agent_a_id" "uuid" NOT NULL,
    "agent_b_id" "uuid" NOT NULL,
    "split_percent" integer DEFAULT 50 NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_experiments_split_percent_check" CHECK ((("split_percent" >= 0) AND ("split_percent" <= 100)))
);


ALTER TABLE "public"."agent_experiments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "ticket_id" "uuid",
    "title" "text" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 30 NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "message_id" "uuid",
    "storage_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "mime_type" "text",
    "size_bytes" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "trigger" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "steps" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."automations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "match_tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "match_intents" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "match_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "match_regex" "text",
    "applies_to" "text"[] DEFAULT '{ai_auto_reply,ai_draft_reply}'::"text"[] NOT NULL,
    "action" "text" DEFAULT 'escalate'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "business_rules_action_check" CHECK (("action" = ANY (ARRAY['escalate'::"text", 'require_approval'::"text"])))
);


ALTER TABLE "public"."business_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" "text",
    "name" "text",
    "phone" "text",
    "avatar_url" "text",
    "company" "text",
    "lifetime_value" numeric(12,2) DEFAULT 0,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "notes" "text",
    "ai_summary" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entity_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "snapshot" "jsonb" NOT NULL,
    "change_note" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "entity_versions_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['business_rule'::"text", 'automation'::"text", 'agent_config'::"text"])))
);


ALTER TABLE "public"."entity_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."member_role" DEFAULT 'agent'::"public"."member_role" NOT NULL,
    "invited_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "accepted_at" timestamp with time zone
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "chunk_index" integer NOT NULL,
    "embedding" "public"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "source_type" "text" DEFAULT 'upload'::"text" NOT NULL,
    "source_url" "text",
    "storage_path" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_visible" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."knowledge_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "ticket_id" "uuid",
    "name" "text",
    "email" "text",
    "company" "text",
    "value" numeric,
    "stage" "text" DEFAULT 'new'::"text" NOT NULL,
    "source" "text" DEFAULT 'ai'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "leads_stage_check" CHECK (("stage" = ANY (ARRAY['new'::"text", 'qualified'::"text", 'won'::"text", 'lost'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."macros" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."macros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."member_role" DEFAULT 'agent'::"public"."member_role" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "sender" "public"."message_sender" NOT NULL,
    "member_id" "uuid",
    "body" "text" NOT NULL,
    "sentiment" "public"."sentiment",
    "is_internal" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_number" "text" NOT NULL,
    "status" "text" DEFAULT 'processing'::"text" NOT NULL,
    "description" "text",
    "total" numeric,
    "tracking_number" "text",
    "tracking_url" "text",
    "ordered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expected_delivery" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "proactive_alert_sent_at" timestamp with time zone,
    "proactive_reason" "text",
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['processing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "subscription_status" "text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "bucket" "text" NOT NULL,
    "window_start" timestamp with time zone NOT NULL,
    "count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "organization_id" "uuid" NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sms_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "ticket_id" "uuid",
    "to_phone" "text" NOT NULL,
    "body" "text" NOT NULL,
    "status" "text" DEFAULT 'simulated'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sms_messages_status_check" CHECK (("status" = ANY (ARRAY['simulated'::"text", 'sent'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."sms_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "assignee_id" "uuid",
    "subject" "text" NOT NULL,
    "status" "public"."ticket_status" DEFAULT 'open'::"public"."ticket_status" NOT NULL,
    "priority" "public"."ticket_priority" DEFAULT 'medium'::"public"."ticket_priority" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "sentiment" "public"."sentiment",
    "intent" "text",
    "ai_resolved" boolean DEFAULT false NOT NULL,
    "first_response_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "channel" "text" DEFAULT 'web'::"text" NOT NULL,
    "csat_rating" integer,
    "csat_comment" "text",
    "csat_token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "csat_sent_at" timestamp with time zone,
    "csat_rated_at" timestamp with time zone,
    "email_ref" "text" DEFAULT "lower"("substring"("replace"(("gen_random_uuid"())::"text", '-'::"text", ''::"text"), 1, 10)) NOT NULL,
    "decision_confidence" numeric,
    "decision_path" "text",
    "decision_reason" "text",
    "experiment_id" "uuid",
    "experiment_variant" "text",
    CONSTRAINT "tickets_csat_rating_check" CHECK ((("csat_rating" >= 1) AND ("csat_rating" <= 5))),
    CONSTRAINT "tickets_decision_confidence_check" CHECK ((("decision_confidence" >= (0)::numeric) AND ("decision_confidence" <= (1)::numeric))),
    CONSTRAINT "tickets_decision_path_check" CHECK (("decision_path" = ANY (ARRAY['auto'::"text", 'cited'::"text", 'escalated'::"text"]))),
    CONSTRAINT "tickets_experiment_variant_check" CHECK (("experiment_variant" = ANY (ARRAY['a'::"text", 'b'::"text"])))
);

ALTER TABLE ONLY "public"."tickets" REPLICA IDENTITY FULL;


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_counters" (
    "organization_id" "uuid" NOT NULL,
    "period" "text" NOT NULL,
    "key" "text" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_counters" OWNER TO "postgres";


ALTER TABLE ONLY "public"."action_requests"
    ADD CONSTRAINT "action_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_configs"
    ADD CONSTRAINT "agent_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_experiments"
    ADD CONSTRAINT "agent_experiments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attachments"
    ADD CONSTRAINT "attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automations"
    ADD CONSTRAINT "automations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_rules"
    ADD CONSTRAINT "business_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_organization_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_versions"
    ADD CONSTRAINT "entity_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_organization_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_documents"
    ADD CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."macros"
    ADD CONSTRAINT "macros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("bucket", "window_start");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("organization_id", "key");



ALTER TABLE ONLY "public"."sms_messages"
    ADD CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_counters"
    ADD CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("organization_id", "period", "key");



CREATE INDEX "action_requests_org_status_idx" ON "public"."action_requests" USING "btree" ("organization_id", "status");



CREATE INDEX "action_requests_ticket_idx" ON "public"."action_requests" USING "btree" ("ticket_id");



CREATE INDEX "activity_log_org_idx" ON "public"."activity_log" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "agent_experiments_org_idx" ON "public"."agent_experiments" USING "btree" ("organization_id", "enabled");



CREATE INDEX "appointments_org_idx" ON "public"."appointments" USING "btree" ("organization_id", "scheduled_at");



CREATE INDEX "business_rules_org_enabled_idx" ON "public"."business_rules" USING "btree" ("organization_id", "enabled");



CREATE INDEX "entity_versions_lookup_idx" ON "public"."entity_versions" USING "btree" ("organization_id", "entity_type", "entity_id", "created_at" DESC);



CREATE INDEX "jobs_due_idx" ON "public"."jobs" USING "btree" ("status", "run_after");



CREATE INDEX "knowledge_chunks_doc_idx" ON "public"."knowledge_chunks" USING "btree" ("document_id");



CREATE INDEX "knowledge_chunks_embedding_idx" ON "public"."knowledge_chunks" USING "hnsw" ("embedding" "public"."vector_cosine_ops");



CREATE INDEX "leads_org_idx" ON "public"."leads" USING "btree" ("organization_id", "stage");



CREATE INDEX "macros_org_idx" ON "public"."macros" USING "btree" ("organization_id", "title");



CREATE INDEX "messages_ticket_idx" ON "public"."messages" USING "btree" ("ticket_id", "created_at");



CREATE INDEX "orders_org_customer_idx" ON "public"."orders" USING "btree" ("organization_id", "customer_id");



CREATE UNIQUE INDEX "orders_org_number_idx" ON "public"."orders" USING "btree" ("organization_id", "order_number");



CREATE UNIQUE INDEX "organizations_stripe_customer_id_idx" ON "public"."organizations" USING "btree" ("stripe_customer_id") WHERE ("stripe_customer_id" IS NOT NULL);



CREATE UNIQUE INDEX "organizations_stripe_subscription_id_idx" ON "public"."organizations" USING "btree" ("stripe_subscription_id") WHERE ("stripe_subscription_id" IS NOT NULL);



CREATE INDEX "sms_messages_org_idx" ON "public"."sms_messages" USING "btree" ("organization_id");



CREATE UNIQUE INDEX "tickets_csat_token_idx" ON "public"."tickets" USING "btree" ("csat_token");



CREATE UNIQUE INDEX "tickets_email_ref_idx" ON "public"."tickets" USING "btree" ("email_ref");



CREATE INDEX "tickets_org_channel_idx" ON "public"."tickets" USING "btree" ("organization_id", "channel");



CREATE INDEX "tickets_org_created_idx" ON "public"."tickets" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "tickets_org_status_idx" ON "public"."tickets" USING "btree" ("organization_id", "status");



CREATE OR REPLACE TRIGGER "automations_updated_at" BEFORE UPDATE ON "public"."automations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "knowledge_documents_updated_at" BEFORE UPDATE ON "public"."knowledge_documents" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tickets_updated_at" BEFORE UPDATE ON "public"."tickets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."action_requests"
    ADD CONSTRAINT "action_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."action_requests"
    ADD CONSTRAINT "action_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."action_requests"
    ADD CONSTRAINT "action_requests_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."action_requests"
    ADD CONSTRAINT "action_requests_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_configs"
    ADD CONSTRAINT "agent_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_experiments"
    ADD CONSTRAINT "agent_experiments_agent_a_id_fkey" FOREIGN KEY ("agent_a_id") REFERENCES "public"."agent_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_experiments"
    ADD CONSTRAINT "agent_experiments_agent_b_id_fkey" FOREIGN KEY ("agent_b_id") REFERENCES "public"."agent_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_experiments"
    ADD CONSTRAINT "agent_experiments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."attachments"
    ADD CONSTRAINT "attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attachments"
    ADD CONSTRAINT "attachments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automations"
    ADD CONSTRAINT "automations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_rules"
    ADD CONSTRAINT "business_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_versions"
    ADD CONSTRAINT "entity_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."entity_versions"
    ADD CONSTRAINT "entity_versions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."knowledge_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_documents"
    ADD CONSTRAINT "knowledge_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."macros"
    ADD CONSTRAINT "macros_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."macros"
    ADD CONSTRAINT "macros_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sms_messages"
    ADD CONSTRAINT "sms_messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sms_messages"
    ADD CONSTRAINT "sms_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."agent_experiments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_counters"
    ADD CONSTRAINT "usage_counters_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE "public"."action_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_log_delete" ON "public"."activity_log" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "activity_log_insert" ON "public"."activity_log" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "activity_log_select" ON "public"."activity_log" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "activity_log_update" ON "public"."activity_log" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "admins write agent_experiments" ON "public"."agent_experiments" USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE (("members"."user_id" = "auth"."uid"()) AND ("members"."role" = ANY (ARRAY['owner'::"public"."member_role", 'admin'::"public"."member_role"])))))) WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE (("members"."user_id" = "auth"."uid"()) AND ("members"."role" = ANY (ARRAY['owner'::"public"."member_role", 'admin'::"public"."member_role"]))))));



CREATE POLICY "admins write business_rules" ON "public"."business_rules" USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE (("members"."user_id" = "auth"."uid"()) AND ("members"."role" = ANY (ARRAY['owner'::"public"."member_role", 'admin'::"public"."member_role"])))))) WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE (("members"."user_id" = "auth"."uid"()) AND ("members"."role" = ANY (ARRAY['owner'::"public"."member_role", 'admin'::"public"."member_role"]))))));



CREATE POLICY "admins write entity_versions" ON "public"."entity_versions" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE (("members"."user_id" = "auth"."uid"()) AND ("members"."role" = ANY (ARRAY['owner'::"public"."member_role", 'admin'::"public"."member_role"]))))));



ALTER TABLE "public"."agent_configs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agent_configs_delete" ON "public"."agent_configs" FOR DELETE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "agent_configs_insert" ON "public"."agent_configs" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "agent_configs_select" ON "public"."agent_configs" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "agent_configs_update" ON "public"."agent_configs" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



ALTER TABLE "public"."agent_experiments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agents write action_requests" ON "public"."action_requests" USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "agents write macros" ON "public"."macros" USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attachments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "attachments_delete" ON "public"."attachments" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "attachments_insert" ON "public"."attachments" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "attachments_select" ON "public"."attachments" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "attachments_update" ON "public"."attachments" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."automations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "automations_delete" ON "public"."automations" FOR DELETE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "automations_insert" ON "public"."automations" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "automations_select" ON "public"."automations" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "automations_update" ON "public"."automations" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



ALTER TABLE "public"."business_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customers_delete" ON "public"."customers" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "customers_insert" ON "public"."customers" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "customers_select" ON "public"."customers" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "customers_update" ON "public"."customers" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."entity_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invitations_delete" ON "public"."invitations" FOR DELETE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "invitations_insert" ON "public"."invitations" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "invitations_select" ON "public"."invitations" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "invitations_update" ON "public"."invitations" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_chunks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "knowledge_chunks_delete" ON "public"."knowledge_chunks" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "knowledge_chunks_insert" ON "public"."knowledge_chunks" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "knowledge_chunks_select" ON "public"."knowledge_chunks" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "knowledge_chunks_update" ON "public"."knowledge_chunks" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."knowledge_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "knowledge_documents_delete" ON "public"."knowledge_documents" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "knowledge_documents_insert" ON "public"."knowledge_documents" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "knowledge_documents_select" ON "public"."knowledge_documents" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "knowledge_documents_update" ON "public"."knowledge_documents" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."macros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members access appointments" ON "public"."appointments" USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members access leads" ON "public"."leads" USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members access orders" ON "public"."orders" USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members access sms_messages" ON "public"."sms_messages" USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members read action_requests" ON "public"."action_requests" FOR SELECT USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members read agent_experiments" ON "public"."agent_experiments" FOR SELECT USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members read business_rules" ON "public"."business_rules" FOR SELECT USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members read entity_versions" ON "public"."entity_versions" FOR SELECT USING (("organization_id" IN ( SELECT "members"."organization_id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "members read macros" ON "public"."macros" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "members_delete" ON "public"."members" FOR DELETE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "members_insert" ON "public"."members" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "members_select" ON "public"."members" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "members_update" ON "public"."members" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_delete" ON "public"."messages" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "messages_insert" ON "public"."messages" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "messages_update" ON "public"."messages" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "org_select" ON "public"."organizations" FOR SELECT USING (("id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "org_update" ON "public"."organizations" FOR UPDATE USING ("public"."user_has_role"("id", 'admin'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("id", 'admin'::"public"."member_role"));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "settings_delete" ON "public"."settings" FOR DELETE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "settings_insert" ON "public"."settings" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



CREATE POLICY "settings_select" ON "public"."settings" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "settings_update" ON "public"."settings" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'admin'::"public"."member_role"));



ALTER TABLE "public"."sms_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tickets_delete" ON "public"."tickets" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "tickets_insert" ON "public"."tickets" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "tickets_select" ON "public"."tickets" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "tickets_update" ON "public"."tickets" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



ALTER TABLE "public"."usage_counters" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usage_counters_delete" ON "public"."usage_counters" FOR DELETE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "usage_counters_insert" ON "public"."usage_counters" FOR INSERT WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



CREATE POLICY "usage_counters_select" ON "public"."usage_counters" FOR SELECT USING (("organization_id" IN ( SELECT "public"."user_org_ids"() AS "user_org_ids")));



CREATE POLICY "usage_counters_update" ON "public"."usage_counters" FOR UPDATE USING ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role")) WITH CHECK ("public"."user_has_role"("organization_id", 'agent'::"public"."member_role"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



REVOKE ALL ON FUNCTION "public"."claim_jobs"("p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_jobs"("p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_workspace"("p_name" "text", "p_slug" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_workspace"("p_name" "text", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_workspace"("p_name" "text", "p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_usage"("p_org" "uuid", "p_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_usage"("p_org" "uuid", "p_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_usage"("p_org" "uuid", "p_key" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_customer_visible_documents"("p_org_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_customer_visible_documents"("p_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_customer_visible_documents"("p_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_customer_visible_documents"("p_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_knowledge_chunks"("query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks"("query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks"("query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "service_role";



REVOKE ALL ON FUNCTION "public"."match_knowledge_chunks_for_org"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks_for_org"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks_for_org"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks_for_org"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "service_role";



REVOKE ALL ON FUNCTION "public"."match_knowledge_chunks_public"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks_public"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks_public"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_knowledge_chunks_public"("p_org_id" "uuid", "query_embedding" "public"."vector", "match_count" integer, "min_similarity" double precision) TO "service_role";



REVOKE ALL ON FUNCTION "public"."rate_limit_gc"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rate_limit_gc"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."rate_limit_hit"("p_bucket" "text", "p_window_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rate_limit_hit"("p_bucket" "text", "p_window_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."redeem_invitation"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."redeem_invitation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."redeem_invitation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."user_has_role"("p_org" "uuid", "p_min" "public"."member_role") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."user_has_role"("p_org" "uuid", "p_min" "public"."member_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_role"("p_org" "uuid", "p_min" "public"."member_role") TO "service_role";



REVOKE ALL ON FUNCTION "public"."user_org_ids"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."user_org_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_org_ids"() TO "service_role";



GRANT ALL ON TABLE "public"."action_requests" TO "anon";
GRANT ALL ON TABLE "public"."action_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."action_requests" TO "service_role";



GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."agent_configs" TO "anon";
GRANT ALL ON TABLE "public"."agent_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_configs" TO "service_role";



GRANT ALL ON TABLE "public"."agent_experiments" TO "anon";
GRANT ALL ON TABLE "public"."agent_experiments" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_experiments" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."attachments" TO "anon";
GRANT ALL ON TABLE "public"."attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."attachments" TO "service_role";



GRANT ALL ON TABLE "public"."automations" TO "anon";
GRANT ALL ON TABLE "public"."automations" TO "authenticated";
GRANT ALL ON TABLE "public"."automations" TO "service_role";



GRANT ALL ON TABLE "public"."business_rules" TO "anon";
GRANT ALL ON TABLE "public"."business_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."business_rules" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."entity_versions" TO "anon";
GRANT ALL ON TABLE "public"."entity_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_versions" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_chunks" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_documents" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_documents" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."macros" TO "anon";
GRANT ALL ON TABLE "public"."macros" TO "authenticated";
GRANT ALL ON TABLE "public"."macros" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."sms_messages" TO "anon";
GRANT ALL ON TABLE "public"."sms_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."sms_messages" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."usage_counters" TO "anon";
GRANT ALL ON TABLE "public"."usage_counters" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_counters" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







