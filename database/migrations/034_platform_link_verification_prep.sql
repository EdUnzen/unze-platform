-- 034: Vorbereitung für kanalweise Plattform-Verifizierung (post-Pilot)
-- Community-weite Verifizierung (communities.is_verified) bleibt unverändert.

ALTER TABLE public.community_platform_links
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

COMMENT ON COLUMN public.community_platform_links.is_verified IS
  'Kanalweise Verifizierung (zukünftig). Fallback: communities.is_verified';
