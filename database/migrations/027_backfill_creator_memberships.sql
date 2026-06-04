-- UNZE: Bestehende Communities ohne Creator-Mitgliedschaft ergänzen (idempotent)

INSERT INTO public.community_members (community_id, user_id, role)
SELECT c.id, c.creator_id, 'creator'::public.community_role
FROM public.communities c
WHERE c.creator_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.community_members m
    WHERE m.community_id = c.id
      AND m.user_id = c.creator_id
      AND m.deleted_at IS NULL
  );
