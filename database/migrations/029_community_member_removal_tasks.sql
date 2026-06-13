-- Phase 1.4: Kündigungs- und Entfernungs-Queue für Creator

CREATE TABLE IF NOT EXISTS public.community_member_removal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.community_members(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (
    reason IN ('subscription_canceling', 'subscription_ended', 'user_left')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_removal_tasks_one_pending_per_user
  ON public.community_member_removal_tasks(community_id, user_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_removal_tasks_community_pending
  ON public.community_member_removal_tasks(community_id, created_at DESC)
  WHERE status = 'pending';

ALTER TABLE public.community_member_removal_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "removal_tasks_select_manage" ON public.community_member_removal_tasks;
CREATE POLICY "removal_tasks_select_manage"
  ON public.community_member_removal_tasks FOR SELECT
  USING (
    public.can_manage_community(community_id)
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "removal_tasks_update_manage" ON public.community_member_removal_tasks;
CREATE POLICY "removal_tasks_update_manage"
  ON public.community_member_removal_tasks FOR UPDATE
  USING (public.can_manage_community(community_id));

GRANT SELECT, UPDATE ON public.community_member_removal_tasks TO authenticated;
GRANT ALL ON public.community_member_removal_tasks TO service_role;

-- Soft-Remove per Community + User (Webhooks, System)
CREATE OR REPLACE FUNCTION public.soft_remove_community_member_by_user(
  p_community_id UUID,
  p_user_id UUID,
  p_actor_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id UUID;
BEGIN
  SELECT id INTO v_member_id
  FROM public.community_members
  WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND deleted_at IS NULL
    AND role <> 'creator'
  LIMIT 1;

  IF v_member_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.community_members
  SET deleted_at = NOW(),
      deleted_by = COALESCE(p_actor_id, p_user_id),
      restored_at = NULL
  WHERE id = v_member_id;

  RETURN v_member_id;
END;
$$;
