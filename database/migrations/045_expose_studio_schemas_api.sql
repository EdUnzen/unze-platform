-- Expose business/studio schemas to PostgREST (Supabase Data API)

GRANT USAGE ON SCHEMA business TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA studio TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA studio_auth TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA business TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA studio TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA studio_auth TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA business TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA studio TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA studio_auth TO service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA business TO service_role;

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, business, studio, studio_auth';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
