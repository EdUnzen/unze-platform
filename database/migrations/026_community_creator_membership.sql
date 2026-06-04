-- UNZE: Creator darf sich beim Anlegen der Community als Mitglied eintragen

DROP POLICY IF EXISTS "community_members_insert_creator" ON public.community_members;

CREATE POLICY "community_members_insert_creator"
  ON public.community_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role = 'creator'
    AND EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
        AND c.creator_id = auth.uid()
    )
  );
