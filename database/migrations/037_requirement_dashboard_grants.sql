-- Dashboard: Creator CRUD for requirement sets, nodes, and credential collections

GRANT INSERT, UPDATE, DELETE ON public.requirement_sets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.requirement_nodes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.credential_collections TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.credential_collection_items TO authenticated;

DROP POLICY IF EXISTS "requirement_sets_manage_community" ON public.requirement_sets;
CREATE POLICY "requirement_sets_manage_community"
  ON public.requirement_sets FOR ALL
  USING (community_id IS NULL OR public.can_manage_community(community_id))
  WITH CHECK (community_id IS NULL OR public.can_manage_community(community_id));

DROP POLICY IF EXISTS "requirement_nodes_manage" ON public.requirement_nodes;
CREATE POLICY "requirement_nodes_manage"
  ON public.requirement_nodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.requirement_sets rs
      WHERE rs.id = set_id
        AND (rs.community_id IS NULL OR public.can_manage_community(rs.community_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requirement_sets rs
      WHERE rs.id = set_id
        AND (rs.community_id IS NULL OR public.can_manage_community(rs.community_id))
    )
  );
