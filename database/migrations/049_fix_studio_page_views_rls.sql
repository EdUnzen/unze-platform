-- Fix: Supabase Advisor rls_disabled_in_public auf studio.page_views
-- Schema studio ist via PostgREST exponiert (045) → RLS muss an sein.
-- service_role bypassed RLS; anon/authenticated haben keine Policies → kein Zugriff.

ALTER TABLE studio.page_views ENABLE ROW LEVEL SECURITY;

-- Absichern falls Grants jemals wieder gesetzt wurden
REVOKE ALL ON TABLE studio.page_views FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE studio.page_views TO service_role;

-- Analytics-RPC nur service_role (Studio-Server)
REVOKE ALL ON FUNCTION studio.path_analytics(text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION studio.path_analytics(text, int) TO service_role;
