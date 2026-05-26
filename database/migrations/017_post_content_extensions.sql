-- Post-Content-Erweiterung: Medien, Gruppen-Kontext, Engagement-Metriken
-- Rückwärtskompatibel — bestehende Posts bleiben unverändert nutzbar

-- =============================================================================
-- Post-Typen erweitern
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'video'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'video';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'clip'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'clip';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'gallery'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'gallery';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'highlight'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'highlight';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'request'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'request';
  END IF;
END $$;

-- =============================================================================
-- Posts: Gruppe, Medien, Metadaten, Engagement
-- =============================================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0);

CREATE INDEX IF NOT EXISTS idx_posts_group ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_type_created ON public.posts(post_type, created_at DESC);

COMMENT ON COLUMN public.posts.media IS 'Array: { type, url, thumbnailUrl?, alt?, durationSec? }';
COMMENT ON COLUMN public.posts.metadata IS 'Event-Zeit, Ort, CTA — typspezifische Zusatzdaten';
