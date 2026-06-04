-- UNZE: Community-Level (auto), Fokus-Tags, Moderator-Anzeigetitel

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS focus_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS community_level TEXT NOT NULL DEFAULT 'bronze'
    CHECK (community_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite')),
  ADD COLUMN IF NOT EXISTS level_score SMALLINT NOT NULL DEFAULT 0
    CHECK (level_score >= 0 AND level_score <= 100),
  ADD COLUMN IF NOT EXISTS show_member_area BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS role_title TEXT;

COMMENT ON COLUMN public.communities.community_level IS
  'Automatisch berechnet — nicht manuell durch Creator setzbar.';
COMMENT ON COLUMN public.community_members.role_title IS
  'Individuelle Anzeige für Moderatoren (z. B. SSL Coach, Turnierleiter).';

CREATE INDEX IF NOT EXISTS idx_communities_level
  ON public.communities(community_level)
  WHERE deleted_at IS NULL;
