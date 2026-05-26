-- UNZE Community Engagement — Aufrufe & Shares (additiv, rückwärtskompatibel)
-- Nach 015_api_table_grants.sql

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS view_count_total BIGINT NOT NULL DEFAULT 0 CHECK (view_count_total >= 0),
  ADD COLUMN IF NOT EXISTS view_count_weekly INTEGER NOT NULL DEFAULT 0 CHECK (view_count_weekly >= 0),
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0);

ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS view_count_weekly INTEGER NOT NULL DEFAULT 0 CHECK (view_count_weekly >= 0),
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0);

COMMENT ON COLUMN public.communities.view_count_weekly IS 'Aggregierte Wochen-Aufrufe (Community-Seite + Discover)';
COMMENT ON COLUMN public.communities.share_count IS 'Anzahl geteilter Community-Links';
COMMENT ON COLUMN public.community_groups.share_count IS 'Anzahl geteilter Gruppen-Links';
