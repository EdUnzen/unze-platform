-- UNZE Business + Studio: logische Trennung in bestehender Supabase-DB
-- Anfragen, Studio-Ingest, Studio-Auth (intern)

CREATE SCHEMA IF NOT EXISTS business;
CREATE SCHEMA IF NOT EXISTS studio;
CREATE SCHEMA IF NOT EXISTS studio_auth;

-- =============================================================================
-- Business: Anfragen von der Landingpage
-- =============================================================================

CREATE TABLE IF NOT EXISTS business.reference_counters (
  year int PRIMARY KEY,
  last_number int NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION business.next_reference_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  y int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  n int;
BEGIN
  INSERT INTO business.reference_counters (year, last_number)
  VALUES (y, 0)
  ON CONFLICT (year) DO NOTHING;

  UPDATE business.reference_counters
  SET last_number = last_number + 1
  WHERE year = y
  RETURNING last_number INTO n;

  RETURN 'UB-' || y::text || '-' || lpad(n::text, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS business.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text NOT NULL UNIQUE DEFAULT business.next_reference_id(),
  inquiry_type text NOT NULL DEFAULT 'quick' CHECK (inquiry_type IN ('quick', 'configure')),
  contact_name text,
  contact_email text NOT NULL,
  company text,
  message text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'ingested', 'error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_inquiries_created
  ON business.inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_inquiries_email
  ON business.inquiries (contact_email);

-- =============================================================================
-- Studio: operative Anfrage (Spiegel aus Business)
-- =============================================================================

CREATE TABLE IF NOT EXISTS studio.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_inquiry_id uuid NOT NULL UNIQUE REFERENCES business.inquiries (id) ON DELETE CASCADE,
  reference_id text NOT NULL UNIQUE,
  inquiry_type text NOT NULL DEFAULT 'quick',
  contact_name text,
  contact_email text NOT NULL,
  company text,
  message text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'neue_anfrage',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_inquiries_status
  ON studio.inquiries (status, created_at DESC);

-- =============================================================================
-- Studio Auth: interne Nutzer (getrennt von Connect profiles)
-- =============================================================================

CREATE TABLE IF NOT EXISTS studio_auth.roles (
  id text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO studio_auth.roles (id, label) VALUES
  ('super_admin', 'Super Admin'),
  ('administrator', 'Administrator'),
  ('projektmanager', 'Projektmanager'),
  ('entwickler', 'Entwickler'),
  ('designer', 'Designer'),
  ('buchhaltung', 'Buchhaltung')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS studio_auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  display_name text,
  role_id text NOT NULL DEFAULT 'super_admin' REFERENCES studio_auth.roles (id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_auth_users_email
  ON studio_auth.users (email);

-- =============================================================================
-- RLS: keine oeffentlichen Policies � Zugriff nur service role / Studio-Session
-- =============================================================================

ALTER TABLE business.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE business.reference_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_auth.roles ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS in Supabase

GRANT USAGE ON SCHEMA business TO service_role;
GRANT USAGE ON SCHEMA studio TO service_role;
GRANT USAGE ON SCHEMA studio_auth TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA business TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA business TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA business TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA studio TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA studio TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA studio_auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA studio_auth TO service_role;
