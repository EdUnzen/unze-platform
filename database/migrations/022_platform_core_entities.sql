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

CREATE TRIGGER community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Bestehende Event-Posts nach community_events kopieren (Daten bleiben in posts)
INSERT INTO public.community_events (
  community_id,
  group_id,
  slug,
  title,
  description,
  starts_at,
  ends_at,
  location,
  external_url,
  created_by,
  created_at,
  updated_at
)
SELECT
  p.community_id,
  p.group_id,
  'event-' || LEFT(REPLACE(p.id::TEXT, '-', ''), 12),
  COALESCE(NULLIF(TRIM(p.title), ''), 'Community-Event'),
  COALESCE(NULLIF(TRIM(p.content), ''), ''),
  COALESCE(
    NULLIF(p.metadata->>'startsAt', '')::TIMESTAMPTZ,
    p.created_at
  ),
  NULLIF(p.metadata->>'endsAt', '')::TIMESTAMPTZ,
  NULLIF(p.metadata->>'location', ''),
  NULLIF(p.metadata->>'externalUrl', ''),
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

CREATE TRIGGER community_reviews_updated_at
  BEFORE UPDATE ON public.community_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER group_reviews_updated_at
  BEFORE UPDATE ON public.group_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER review_comments_updated_at
  BEFORE UPDATE ON public.review_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS: community_events
-- =============================================================================
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_events_select_public"
  ON public.community_events FOR SELECT
  USING (
    is_public = TRUE
    AND public.is_community_visible(community_id)
  );

CREATE POLICY "community_events_select_member"
  ON public.community_events FOR SELECT
  TO authenticated
  USING (public.is_community_member(community_id));

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

CREATE POLICY "community_reviews_select"
  ON public.community_reviews FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "community_reviews_insert_member"
  ON public.community_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND public.is_community_member(community_id)
  );

CREATE POLICY "community_reviews_update_own"
  ON public.community_reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "group_reviews_select"
  ON public.group_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_groups g
      WHERE g.id = group_reviews.group_id
        AND public.is_community_visible(g.community_id)
    )
  );

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

CREATE POLICY "group_reviews_update_own"
  ON public.group_reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "review_comments_select"
  ON public.review_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "review_comments_insert_authenticated"
  ON public.review_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "review_comments_update_own"
  ON public.review_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "review_comments_delete_own"
  ON public.review_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());
