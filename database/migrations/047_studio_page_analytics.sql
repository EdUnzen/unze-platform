-- Einfache First-Party Web-Statistik für UNZE Studio (ohne externes Abo)
-- Speichert nur Pfad + anonyme Besucher-ID — keine IPs, keine personenbezogenen Daten.

CREATE TABLE IF NOT EXISTS studio.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL CHECK (char_length(path) <= 500),
  visitor_id text NOT NULL CHECK (char_length(visitor_id) <= 64),
  referrer text CHECK (referrer IS NULL OR char_length(referrer) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_page_views_path_created
  ON studio.page_views (path, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_page_views_created
  ON studio.page_views (created_at DESC);

CREATE OR REPLACE FUNCTION studio.path_analytics(path_prefix text, period_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'pageviews', COUNT(*)::bigint,
    'visitors', COUNT(DISTINCT visitor_id)::bigint
  )
  FROM studio.page_views
  WHERE path LIKE path_prefix || '%'
    AND created_at >= now() - make_interval(days => GREATEST(period_days, 1));
$$;

REVOKE ALL ON studio.page_views FROM PUBLIC, anon, authenticated;
GRANT ALL ON studio.page_views TO service_role;
GRANT EXECUTE ON FUNCTION studio.path_analytics(text, int) TO service_role;
