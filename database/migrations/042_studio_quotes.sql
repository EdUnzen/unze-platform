-- Studio: Angebote & Zahlungen (Business Stripe)
-- Referenz: AN-YYYY-NNNN

CREATE TABLE IF NOT EXISTS studio.quote_counters (
  year int PRIMARY KEY,
  last_number int NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION studio.next_quote_reference_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  y int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  n int;
BEGIN
  INSERT INTO studio.quote_counters (year, last_number)
  VALUES (y, 0)
  ON CONFLICT (year) DO NOTHING;

  UPDATE studio.quote_counters
  SET last_number = last_number + 1
  WHERE year = y
  RETURNING last_number INTO n;

  RETURN 'AN-' || y::text || '-' || lpad(n::text, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS studio.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES studio.inquiries (id) ON DELETE SET NULL,
  reference_id text NOT NULL UNIQUE DEFAULT studio.next_quote_reference_id(),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'paid')),
  title text,
  customer_name text,
  customer_email text NOT NULL,
  company text,
  subtotal_cents int NOT NULL,
  tax_rate numeric(5, 2) NOT NULL DEFAULT 19.00,
  tax_cents int NOT NULL,
  total_cents int NOT NULL,
  valid_until date,
  notes text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimate_snapshot jsonb,
  stripe_checkout_session_id text,
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_quotes_inquiry
  ON studio.quotes (inquiry_id);

CREATE INDEX IF NOT EXISTS idx_studio_quotes_status
  ON studio.quotes (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_quotes_payment
  ON studio.quotes (payment_status, created_at DESC);

ALTER TABLE studio.quote_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.quotes ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA studio TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA studio TO service_role;
