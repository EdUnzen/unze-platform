-- Optional: Entwicklungs-Seed (nur wenn ein Test-User existiert)
-- Ersetze USER_ID mit deiner auth.users UUID nach Registrierung

-- Beispiel (auskommentiert):
/*
INSERT INTO public.communities (
  slug, title, description, banner_gradient, platform_type,
  category, tags, visibility, creator_id, is_verified, is_trending
) VALUES (
  'creator-hub',
  'Creator Hub',
  'Netzwerk für Creator, die Communities aufbauen und monetarisieren wollen.',
  'from-emerald-500/90 via-teal-600/80 to-cyan-700/70',
  'unze',
  'Kreativität',
  ARRAY['Creator', 'Networking', 'Wachstum'],
  'public',
  'USER_ID_HERE',
  TRUE,
  TRUE
);
*/
