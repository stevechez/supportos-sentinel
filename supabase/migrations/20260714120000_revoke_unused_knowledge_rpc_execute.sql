-- Phase 18G pilot safety audit finding: three SECURITY DEFINER RPCs
-- (list_customer_visible_documents, match_knowledge_chunks_for_org,
-- match_knowledge_chunks_public) accept an arbitrary p_org_id parameter
-- and were EXECUTE-able by anon/authenticated. Because they run as
-- SECURITY DEFINER, they bypass the organization-scoped RLS on
-- knowledge_documents/knowledge_chunks entirely -- any signed-in user (or
-- an anonymous one, for two of the three) could pass another
-- organization's id and read that organization's knowledge base content
-- directly via the PostgREST RPC endpoint, with no relationship to that
-- organization required.
--
-- Nothing in this application calls these functions (confirmed in the
-- Phase 15 audit -- knowledge_documents/knowledge_chunks are part of the
-- unused "chat agent" schema with zero application code touching them).
-- Revoking EXECUTE from anon/authenticated closes the exposure without
-- touching the tables, their RLS, or any code path Sentinel actually
-- uses. If a future phase wires up knowledge search for real, EXECUTE
-- should be re-granted alongside a caller-identity check inside the
-- function (e.g. requiring the caller to be a member of p_org_id), not
-- just re-opened as-is.
revoke execute on function public.list_customer_visible_documents(uuid) from anon, authenticated;
revoke execute on function public.match_knowledge_chunks_for_org(uuid, vector, integer, double precision) from anon, authenticated;
revoke execute on function public.match_knowledge_chunks_public(uuid, vector, integer, double precision) from anon, authenticated;
