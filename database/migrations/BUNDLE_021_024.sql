-- UNZE Phase-1 Stabilisierung: Migrationen 021-024
-- Supabase SQL Editor: gesamtes Skript ausfuehren
-- Fix: community_events-Backfill ohne posts.group_id/metadata (Migration 017 optional)

-- =============================================================================
-- 021_platform_feature_flags.sql
-- =============================================================================

-- UNZE Phase 1: Feature-Flags — Feed/Posts deaktivieren ohne Löschen
-- Nach 020_performance_indexes.sql

-- =============================================================================
-- Feature-Flag-Tabelle
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.platform_feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS platform_feature_flags_updated_at ON public.platform_feature_flags;
CREATE TRIGGER platform_feature_flags_updated_at BEFORE UPDATE ON public.platform_feature_flags FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.platform_feature_flags (key, enabled, description) VALUES
  ('feed_posts', FALSE, 'Feed-Beiträge (posts) — Social-Media-Feed deaktiviert'),
  ('post_comments', FALSE, 'Kommentare an Posts'),
  ('post_likes', FALSE, 'Likes auf Posts')
ON CONFLICT (key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =============================================================================
-- Hilfsfunktion für RLS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_platform_feature_enabled(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT enabled FROM public.platform_feature_flags WHERE key = p_key),
    TRUE
  );
$$;

-- =============================================================================
-- RLS: Schreibzugriff auf Feed-Tabellen nur wenn Flag aktiv
-- =============================================================================
DROP POLICY IF EXISTS "posts_insert_authenticated" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_when_enabled" ON public.posts;
CREATE POLICY "posts_insert_when_enabled"
  ON public.posts FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('feed_posts')
    AND auth.uid() = author_id
    AND (
      community_id IS NULL
      OR public.is_community_member(community_id)
    )
  );

DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_when_enabled" ON public.comments;
CREATE POLICY "comments_insert_when_enabled"
  ON public.comments FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('post_comments')
    AND auth.uid() = author_id
  );

DROP POLICY IF EXISTS "post_likes_insert_own" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_insert_when_enabled" ON public.post_likes;
CREATE POLICY "post_likes_insert_when_enabled"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('post_likes')
    AND auth.uid() = user_id
  );

-- =============================================================================
-- RLS auf Feature-Flags (nur lesen für authenticated)
-- =============================================================================
ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_flags_select_authenticated" ON public.platform_feature_flags;
CREATE POLICY "feature_flags_select_authenticated"
  ON public.platform_feature_flags FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "feature_flags_select_anon" ON public.platform_feature_flags;
CREATE POLICY "feature_flags_select_anon"
  ON public.platform_feature_flags FOR SELECT
  TO anon
  USING (TRUE);

DROP POLICY IF EXISTS "feature_flags_manage_platform_admin" ON public.platform_feature_flags;
CREATE POLICY "feature_flags_manage_platform_admin"
  ON public.platform_feature_flags FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));


-- =============================================================================
-- 022_platform_core_entities.sql
-- =============================================================================

-- UNZE Phase 1: Events, Gruppen-Typen, Gruppen-Follow, Experte-Rolle, Bewertungen
-- Additiv — keine Tabellen löschen. Nach 021_platform_feature_flags.sql

-- =============================================================================
-- Rolle: Experte / Coach
-- =============================================================================
ALTER TYPE public.community_role ADD VALUE IF NOT EXISTS 'expert';

-- =============================================================================
-- Gruppen-Typ (group | service)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'community_group_type') THEN
    CREATE TYPE public.community_group_type AS ENUM ('group', 'service');
  END IF;
END $$;

ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS group_type public.community_group_type NOT NULL DEFAULT 'group',
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0
    CHECK (rating_avg >= 0 AND rating_avg <= 5),
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0
    CHECK (review_count >= 0),
  ADD COLUMN IF NOT EXISTS member_count INTEGER NOT NULL DEFAULT 0
    CHECK (member_count >= 0);

CREATE INDEX IF NOT EXISTS idx_community_groups_type
  ON public.community_groups(group_type, sort_order);

-- =============================================================================
-- Community-Events (eigene Entität — nicht Feed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  external_url TEXT,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, slug),
  CONSTRAINT community_events_slug_format CHECK (slug ~ '^[a-z0-9-]{2,60}$')
);

CREATE INDEX IF NOT EXISTS idx_community_events_starts
  ON public.community_events(starts_at DESC)
  WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_community_events_community
  ON public.community_events(community_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_events_featured
  ON public.community_events(is_featured, starts_at DESC)
  WHERE is_public = TRUE AND is_featured = TRUE;

DROP TRIGGER IF EXISTS community_events_updated_at ON public.community_events;
CREATE TRIGGER community_events_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Event-Backfill: posts ohne group_id/metadata (Schema zzbjvcwmdrnuzzlepfja, Migration 017 nicht angewendet)
INSERT INTO public.community_events (
  community_id,
  slug,
  title,
  description,
  starts_at,
  created_by,
  created_at,
  updated_at
)
SELECT
  p.community_id,
  'event-' || LEFT(REPLACE(p.id::TEXT, '-', ''), 12),
  COALESCE(NULLIF(TRIM(p.title), ''), 'Community-Event'),
  COALESCE(NULLIF(TRIM(p.content), ''), ''),
  p.created_at,
  p.author_id,
  p.created_at,
  p.updated_at
FROM public.posts p
WHERE p.post_type = 'event'
  AND p.community_id IS NOT NULL
ON CONFLICT (community_id, slug) DO NOTHING;

-- =============================================================================
-- Gruppen-Follow (follows erweitern)
-- =============================================================================
ALTER TYPE public.follow_target ADD VALUE IF NOT EXISTS 'group';
-- PG: neuer Enum-Wert erst nach COMMIT in Constraints nutzbar
COMMIT;

ALTER TABLE public.follows
  ADD COLUMN IF NOT EXISTS target_group_id UUID
    REFERENCES public.community_groups(id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_single_target;
ALTER TABLE public.follows ADD CONSTRAINT follows_single_target CHECK (
  (
    target_type = 'user'
    AND target_user_id IS NOT NULL
    AND target_community_id IS NULL
    AND target_group_id IS NULL
  )
  OR (
    target_type = 'community'
    AND target_community_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_group_id IS NULL
  )
  OR (
    target_type = 'group'
    AND target_group_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_community_id IS NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_group
  ON public.follows(follower_id, target_group_id)
  WHERE target_type = 'group';

-- =============================================================================
-- Bewertungen & Kommentare zu Bewertungen (Community + Gruppe)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.group_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL,
  review_target TEXT NOT NULL CHECK (review_target IN ('community', 'group')),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_comments_target_consistency CHECK (
    (review_target = 'community')
    OR (review_target = 'group')
  )
);

CREATE INDEX IF NOT EXISTS idx_community_reviews_community
  ON public.community_reviews(community_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_reviews_group
  ON public.group_reviews(group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_comments_review
  ON public.review_comments(review_id, review_target, created_at);

DROP TRIGGER IF EXISTS community_reviews_updated_at ON public.community_reviews;
CREATE TRIGGER community_reviews_updated_at BEFORE UPDATE ON public.community_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS group_reviews_updated_at ON public.group_reviews;
CREATE TRIGGER group_reviews_updated_at BEFORE UPDATE ON public.group_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS review_comments_updated_at ON public.review_comments;
CREATE TRIGGER review_comments_updated_at BEFORE UPDATE ON public.review_comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS: community_events
-- =============================================================================
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_events_select_public" ON public.community_events;
CREATE POLICY "community_events_select_public"
  ON public.community_events FOR SELECT
  USING (
    is_public = TRUE
    AND public.is_community_visible(community_id)
  );

DROP POLICY IF EXISTS "community_events_select_member" ON public.community_events;
CREATE POLICY "community_events_select_member"
  ON public.community_events FOR SELECT
  TO authenticated
  USING (public.is_community_member(community_id));

DROP POLICY IF EXISTS "community_events_manage" ON public.community_events;
CREATE POLICY "community_events_manage"
  ON public.community_events FOR ALL
  TO authenticated
  USING (public.can_manage_community(community_id))
  WITH CHECK (public.can_manage_community(community_id));

-- =============================================================================
-- RLS: Gruppen-Follow
-- =============================================================================
DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- =============================================================================
-- RLS: Bewertungen
-- =============================================================================
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_reviews_select" ON public.community_reviews;
CREATE POLICY "community_reviews_select"
  ON public.community_reviews FOR SELECT
  USING (public.is_community_visible(community_id));

DROP POLICY IF EXISTS "community_reviews_insert_member" ON public.community_reviews;
CREATE POLICY "community_reviews_insert_member"
  ON public.community_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND public.is_community_member(community_id)
  );

DROP POLICY IF EXISTS "community_reviews_update_own" ON public.community_reviews;
CREATE POLICY "community_reviews_update_own"
  ON public.community_reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "group_reviews_select" ON public.group_reviews;
CREATE POLICY "group_reviews_select"
  ON public.group_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_groups g
      WHERE g.id = group_reviews.group_id
        AND public.is_community_visible(g.community_id)
    )
  );

DROP POLICY IF EXISTS "group_reviews_insert_member" ON public.group_reviews;
CREATE POLICY "group_reviews_insert_member"
  ON public.group_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.community_groups g
      JOIN public.community_members m ON m.community_id = g.community_id
      WHERE g.id = group_reviews.group_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "group_reviews_update_own" ON public.group_reviews;
CREATE POLICY "group_reviews_update_own"
  ON public.group_reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "review_comments_select" ON public.review_comments;
CREATE POLICY "review_comments_select"
  ON public.review_comments FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "review_comments_insert_authenticated" ON public.review_comments;
CREATE POLICY "review_comments_insert_authenticated"
  ON public.review_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "review_comments_update_own" ON public.review_comments;
CREATE POLICY "review_comments_update_own"
  ON public.review_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "review_comments_delete_own" ON public.review_comments;
CREATE POLICY "review_comments_delete_own"
  ON public.review_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());


-- =============================================================================
-- 023_sync_rating_aggregates.sql
-- =============================================================================

-- Einmalig: Bewertungs-Aggregate mit tatsächlichen Reviews abgleichen
-- Nach 022 ausführen wenn Demo-Daten falsche rating_avg/review_count haben

UPDATE public.communities c
SET
  rating_avg = COALESCE(sub.avg, 0),
  review_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT
    community_id,
    ROUND(AVG(rating)::numeric, 2) AS avg,
    COUNT(*)::integer AS cnt
  FROM public.community_reviews
  GROUP BY community_id
) sub
WHERE c.id = sub.community_id;

UPDATE public.communities
SET rating_avg = 0, review_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.community_reviews r WHERE r.community_id = communities.id
)
AND (rating_avg <> 0 OR review_count <> 0);

UPDATE public.community_groups g
SET
  rating_avg = COALESCE(sub.avg, 0),
  review_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT
    group_id,
    ROUND(AVG(rating)::numeric, 2) AS avg,
    COUNT(*)::integer AS cnt
  FROM public.group_reviews
  GROUP BY group_id
) sub
WHERE g.id = sub.group_id;

UPDATE public.community_groups
SET rating_avg = 0, review_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.group_reviews r WHERE r.group_id = community_groups.id
)
AND (rating_avg <> 0 OR review_count <> 0);


-- =============================================================================
-- 024_stripe_monetization_events.sql
-- =============================================================================

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
CREATE TRIGGER community_payments_updated_at BEFORE UPDATE ON public.community_payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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
-- PG: neuer Enum-Wert erst nach COMMIT in Constraints nutzbar
COMMIT;

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

-- =============================================================================
-- 015_api_table_grants.sql (neue Tabellen für PostgREST exponieren)
-- =============================================================================

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

