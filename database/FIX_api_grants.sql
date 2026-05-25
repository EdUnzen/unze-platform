-- Schnell-Fix: einmal im Supabase SQL Editor ausführen
-- Behebt: permission denied for table communities (42501)
-- Hinweis: Das ist kein RLS-Problem — PostgreSQL-Tabellenrechte fehlen für PostgREST-Rollen.

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS
  TO anon, authenticated, service_role;
