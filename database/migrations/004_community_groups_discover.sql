-- Community-Gruppen & Discover-Vorbereitung
-- Nach 002_rls_policies.sql ausführen

-- =============================================================================
-- Discover-Felder auf Communities
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS discover_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS discover_score INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_communities_discover
  ON public.communities(discover_enabled, discover_score DESC, member_count DESC)
  WHERE discover_enabled = TRUE AND visibility IN ('public', 'premium');

-- =============================================================================
-- Gruppen innerhalb von Communities
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, slug),
  CONSTRAINT community_groups_slug_format CHECK (slug ~ '^[a-z0-9-]{2,40}$')
);

CREATE INDEX IF NOT EXISTS idx_community_groups_community
  ON public.community_groups(community_id, sort_order);

-- =============================================================================
-- Trigger updated_at
-- =============================================================================
CREATE TRIGGER community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_groups_select"
  ON public.community_groups FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "community_groups_manage"
  ON public.community_groups FOR ALL
  USING (public.can_manage_community(community_id))
  WITH CHECK (public.can_manage_community(community_id));
