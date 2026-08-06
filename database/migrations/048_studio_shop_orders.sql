-- UNZE Business Shop: Aufträge, Nachrichten (Studio-only, getrennt von Connect)
-- Referenz: SH-YYYY-NNNN · Rechnung: RE- aus reference_id

CREATE TABLE IF NOT EXISTS studio.shop_order_counters (
  year int PRIMARY KEY,
  last_number int NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION studio.next_shop_order_reference_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  y int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  n int;
BEGIN
  INSERT INTO studio.shop_order_counters (year, last_number)
  VALUES (y, 0)
  ON CONFLICT (year) DO NOTHING;

  UPDATE studio.shop_order_counters
  SET last_number = last_number + 1
  WHERE year = y
  RETURNING last_number INTO n;

  RETURN 'SH-' || y::text || '-' || lpad(n::text, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS studio.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text NOT NULL UNIQUE DEFAULT studio.next_shop_order_reference_id(),
  product_id text NOT NULL,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  product_type text NOT NULL CHECK (
    product_type IN ('analyse', 'grund', 'template', 'pauschal', 'servicepaket', 'individuell')
  ),
  customer_name text,
  customer_email text NOT NULL,
  company text,
  customer_message text,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('pending_payment', 'paid', 'in_progress', 'completed', 'cancelled')
  ),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'pending', 'paid', 'refunded')
  ),
  subtotal_cents int NOT NULL,
  tax_rate numeric(5, 2) NOT NULL DEFAULT 0,
  tax_cents int NOT NULL DEFAULT 0,
  total_cents int NOT NULL,
  processing_time text,
  source text,
  stripe_checkout_session_id text,
  stripe_subscription_id text,
  client_id uuid REFERENCES studio.clients (id) ON DELETE SET NULL,
  inquiry_id uuid REFERENCES studio.inquiries (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_shop_orders_status
  ON studio.shop_orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_shop_orders_email
  ON studio.shop_orders (customer_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_shop_orders_payment
  ON studio.shop_orders (payment_status, created_at DESC);

CREATE TABLE IF NOT EXISTS studio.order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES studio.shop_orders (id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound', 'system')),
  subject text,
  body text NOT NULL,
  from_email text,
  to_email text,
  created_by_studio_user_id uuid,
  external_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_order_messages_order
  ON studio.order_messages (order_id, created_at ASC);

ALTER TABLE studio.shop_order_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio.order_messages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA studio TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA studio TO service_role;
