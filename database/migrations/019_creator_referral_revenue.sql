-- Creator Referral & Revenue Share (optional, kein MLM)
-- Rückwärtskompatibel — bestehende Tabellen unverändert

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    CREATE TYPE public.referral_status AS ENUM (
      'pending', 'active', 'conflict', 'revoked'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.creator_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  conflict_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_referrals_no_self CHECK (referred_user_id <> referrer_user_id),
  CONSTRAINT creator_referrals_referred_unique UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_referrals_referrer
  ON public.creator_referrals(referrer_user_id, status);

CREATE TABLE IF NOT EXISTS public.revenue_share_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  creator_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gross_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (gross_amount_cents >= 0),
  platform_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_cents >= 0),
  net_platform_cents INTEGER NOT NULL DEFAULT 0 CHECK (net_platform_cents >= 0),
  referrer_share_cents INTEGER NOT NULL DEFAULT 0 CHECK (referrer_share_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  ledger_status TEXT NOT NULL DEFAULT 'sandbox'
    CHECK (ledger_status IN ('sandbox', 'pending', 'paid', 'void')),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_ledger_creator
  ON public.revenue_share_ledger(creator_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_referrer
  ON public.revenue_share_ledger(referrer_user_id, created_at DESC)
  WHERE referrer_user_id IS NOT NULL;

CREATE TRIGGER creator_referrals_updated_at
  BEFORE UPDATE ON public.creator_referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.creator_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_share_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_referrals_select_involved"
  ON public.creator_referrals FOR SELECT
  USING (
    auth.uid() = referred_user_id
    OR auth.uid() = referrer_user_id
  );

CREATE POLICY "creator_referrals_insert_self"
  ON public.creator_referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);

CREATE POLICY "creator_referrals_update_self"
  ON public.creator_referrals FOR UPDATE
  USING (auth.uid() = referred_user_id)
  WITH CHECK (auth.uid() = referred_user_id);

CREATE POLICY "revenue_ledger_select_involved"
  ON public.revenue_share_ledger FOR SELECT
  USING (
    auth.uid() = creator_user_id
    OR auth.uid() = referrer_user_id
  );

COMMENT ON TABLE public.creator_referrals IS 'Optional: Creator gibt an, wer ihn geworben hat — kein MLM';
COMMENT ON TABLE public.revenue_share_ledger IS 'Netto Revenue Share — Sandbox + später Stripe';
