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

CREATE TRIGGER platform_feature_flags_updated_at
  BEFORE UPDATE ON public.platform_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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
CREATE POLICY "comments_insert_when_enabled"
  ON public.comments FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('post_comments')
    AND auth.uid() = author_id
  );

DROP POLICY IF EXISTS "post_likes_insert_own" ON public.post_likes;
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

CREATE POLICY "feature_flags_select_authenticated"
  ON public.platform_feature_flags FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "feature_flags_select_anon"
  ON public.platform_feature_flags FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "feature_flags_manage_platform_admin"
  ON public.platform_feature_flags FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));
