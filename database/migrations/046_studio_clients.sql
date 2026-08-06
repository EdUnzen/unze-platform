-- Studio: schlanke Kundenverwaltung (Stammdaten, Domains, Hosting, Verträge)

CREATE TABLE IF NOT EXISTS studio.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  contact_email text NOT NULL,
  contact_phone text,
  street text,
  postal_code text,
  city text,
  country text NOT NULL DEFAULT 'Deutschland',
  notes text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  source_inquiry_id uuid REFERENCES studio.inquiries (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_clients_email ON studio.clients (contact_email);
CREATE INDEX IF NOT EXISTS idx_studio_clients_status ON studio.clients (status, company_name);

CREATE TABLE IF NOT EXISTS studio.client_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES studio.clients (id) ON DELETE CASCADE,
  domain text NOT NULL,
  registrar text,
  expires_at date,
  auto_renew boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_client_domains_client ON studio.client_domains (client_id);
CREATE INDEX IF NOT EXISTS idx_studio_client_domains_expires ON studio.client_domains (expires_at);

CREATE TABLE IF NOT EXISTS studio.client_hosting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES studio.clients (id) ON DELETE CASCADE,
  provider text NOT NULL,
  plan_name text,
  url text,
  monthly_cents int,
  billing_notes text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_client_hosting_client ON studio.client_hosting (client_id);

CREATE TABLE IF NOT EXISTS studio.client_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES studio.clients (id) ON DELETE CASCADE,
  title text NOT NULL,
  contract_type text NOT NULL DEFAULT 'maintenance'
    CHECK (contract_type IN ('maintenance', 'hosting', 'support', 'other')),
  amount_cents int,
  billing_cycle text
    CHECK (billing_cycle IS NULL OR billing_cycle IN ('monthly', 'yearly', 'one_time')),
  starts_at date,
  ends_at date,
  next_billing_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_client_contracts_client ON studio.client_contracts (client_id);
CREATE INDEX IF NOT EXISTS idx_studio_client_contracts_next_billing ON studio.client_contracts (next_billing_at);

ALTER TABLE studio.inquiries
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES studio.clients (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_studio_inquiries_client ON studio.inquiries (client_id);

ALTER TABLE studio.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.client_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.client_hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.client_contracts ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA studio TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA studio TO service_role;
