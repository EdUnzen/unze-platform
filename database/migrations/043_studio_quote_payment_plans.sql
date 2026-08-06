-- Studio Angebote: Zahlungspläne (50/50, Raten)

ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS payment_plan text NOT NULL DEFAULT 'full'
  CHECK (payment_plan IN ('full', 'split_50_50', 'installments_3', 'installments_6'));

ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS charge_total_cents int;
ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS amount_paid_cents int NOT NULL DEFAULT 0;
ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS payment_phase text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_phase IN ('unpaid', 'pending', 'deposit_paid', 'completed'));

ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS installment_count int;
ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS installments_paid int NOT NULL DEFAULT 0;
ALTER TABLE studio.quotes ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE studio.quotes DROP CONSTRAINT IF EXISTS quotes_payment_status_check;
ALTER TABLE studio.quotes ADD CONSTRAINT quotes_payment_status_check
  CHECK (payment_status IN ('unpaid', 'pending', 'partial', 'paid', 'refunded'));

-- charge_total aus total_cents backfill
UPDATE studio.quotes
SET charge_total_cents = total_cents
WHERE charge_total_cents IS NULL;
