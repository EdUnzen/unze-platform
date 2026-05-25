-- Dashboard: Manager dürfen alle Mitglieder einer Community sehen
-- Nach 004 ausführen

DROP POLICY IF EXISTS "community_members_select" ON public.community_members;

CREATE POLICY "community_members_select"
  ON public.community_members FOR SELECT
  USING (
    public.can_manage_community(community_id)
    OR public.can_moderate_community(community_id)
    OR public.is_community_visible(community_id)
    OR user_id = auth.uid()
  );
