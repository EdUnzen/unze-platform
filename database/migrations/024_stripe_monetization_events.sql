-- UNZE Monetization: Stripe-Abos, Zahlungen, Event-Favoriten
-- Nach 023_sync_rating_aggregates.sql

-- =============================================================================
-- Community-Preise & Stripe Price IDs
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS price_monthly_cents INTEGER CHECK (price_monthly_cents IS NULL OR price_monthly_cents >= 0),
  ADD COLUMN IF NOT EXISTS price_semiannual_cents INTEGER CHECK (price_semiannual_cents IS NULL OR price_semiannual_cents >= 0),
  ADD COLUMN IF NOT EXISTS price_yearly_cents INTEGER CHECK (price_yearly_cents IS NULL OR price_yearly_cents >= 0),
  ADD COLUMN IF NOT EXISTS stripe_price_monthly_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_semiannual_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_yearly_id TEXT;

-- =============================================================================
-- Subscriptions erweitern
-- =============================================================================
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_subscriptions_group
  ON public.subscriptions(group_id)
  WHERE group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_community_status
  ON public.subscriptions(community_id, status);

-- =============================================================================
-- Einmalzahlungen & Buchungen
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  payment_kind TEXT NOT NULL DEFAULT 'one_time'
    CHECK (payment_kind IN ('one_time', 'subscription_invoice')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_payments_user
  ON public.community_payments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_payments_community
  ON public.community_payments(community_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_payments_stripe_session
  ON public.community_payments(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

DROP TRIGGER IF EXISTS community_payments_updated_at ON public.community_payments;
CREATE TRIGGER community_payments_updated_at
  BEFORE UPDATE ON public.community_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- Webhook-Idempotenz
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Gruppen: Stripe Price für Einmalzahlung
-- =============================================================================
ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- =============================================================================
-- Event-Favoriten (follows erweitern)
-- =============================================================================
ALTER TYPE public.follow_target ADD VALUE IF NOT EXISTS 'event';

ALTER TABLE public.follows
  ADD COLUMN IF NOT EXISTS target_event_id UUID
    REFERENCES public.community_events(id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_single_target;
ALTER TABLE public.follows ADD CONSTRAINT follows_single_target CHECK (
  (
    target_type = 'user'
    AND target_user_id IS NOT NULL
    AND target_community_id IS NULL
    AND target_group_id IS NULL
    AND target_event_id IS NULL
  )
  OR (
    target_type = 'community'
    AND target_community_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_group_id IS NULL
    AND target_event_id IS NULL
  )
  OR (
    target_type = 'group'
    AND target_group_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_community_id IS NULL
    AND target_event_id IS NULL
  )
  OR (
    target_type = 'event'
    AND target_event_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_community_id IS NULL
    AND target_group_id IS NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_event
  ON public.follows(follower_id, target_event_id)
  WHERE target_type = 'event';

-- =============================================================================
-- RLS: community_payments
-- =============================================================================
ALTER TABLE public.community_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_payments_select_own" ON public.community_payments;
CREATE POLICY "community_payments_select_own"
  ON public.community_payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "community_payments_select_community_mod" ON public.community_payments;
CREATE POLICY "community_payments_select_community_mod"
  ON public.community_payments FOR SELECT
  TO authenticated
  USING (public.can_manage_community(community_id));

DROP POLICY IF EXISTS "community_payments_insert_service" ON public.community_payments;
CREATE POLICY "community_payments_insert_service"
  ON public.community_payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "community_payments_update_service" ON public.community_payments;
CREATE POLICY "community_payments_update_service"
  ON public.community_payments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Webhook events: nur Service Role (keine anon policies)
