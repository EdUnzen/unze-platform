-- UNZE Platform Integrity — Creator-Mitgliedschaft & Daten-Konsistenz
-- Nach 013_platform_events.sql ausführen

-- Creator fehlt in community_members (z.B. vor Trigger oder manuelle Inserts)
INSERT INTO public.community_members (community_id, user_id, role)
SELECT c.id, c.creator_id, 'creator'::public.community_role
FROM public.communities c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.community_members m
  WHERE m.community_id = c.id
    AND m.user_id = c.creator_id
)
ON CONFLICT (community_id, user_id) DO UPDATE
  SET role = EXCLUDED.role
  WHERE public.community_members.role <> 'creator'::public.community_role;

-- Mitgliederzähler mit tatsächlichen Mitgliedern abgleichen
UPDATE public.communities c
SET member_count = sub.cnt
FROM (
  SELECT community_id, COUNT(*)::INTEGER AS cnt
  FROM public.community_members
  GROUP BY community_id
) sub
WHERE c.id = sub.community_id
  AND c.member_count IS DISTINCT FROM sub.cnt;

-- Trigger absichern (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator')
  ON CONFLICT (community_id, user_id) DO UPDATE
    SET role = 'creator'::public.community_role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();
