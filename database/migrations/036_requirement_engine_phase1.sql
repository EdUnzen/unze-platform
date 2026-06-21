-- Sprint 3 / Review 2: Requirement-Engine Phase 1, post-check-in rewards, badges -> credentials

-- =============================================================================
-- Schema extensions
-- =============================================================================

ALTER TABLE public.requirement_nodes
  ADD COLUMN IF NOT EXISTS predicate_value TEXT;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE public.community_events
  ADD COLUMN IF NOT EXISTS check_in_credential_id UUID
    REFERENCES public.credentials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS check_in_group_id UUID
    REFERENCES public.community_groups(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.user_group_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_group_unlocks_unique UNIQUE (user_id, group_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_user_group_unlocks_user
  ON public.user_group_unlocks(user_id, community_id);

ALTER TABLE public.user_group_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_group_unlocks_select_own" ON public.user_group_unlocks;
CREATE POLICY "user_group_unlocks_select_own"
  ON public.user_group_unlocks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_group_unlocks_select_manage" ON public.user_group_unlocks;
CREATE POLICY "user_group_unlocks_select_manage"
  ON public.user_group_unlocks FOR SELECT
  USING (public.can_manage_community(community_id));

GRANT SELECT ON public.user_group_unlocks TO authenticated;
GRANT ALL ON public.user_group_unlocks TO service_role;

-- =============================================================================
-- Legacy badges -> credentials (same IDs for compatibility)
-- =============================================================================

INSERT INTO public.credentials (
  id,
  community_id,
  name,
  description,
  validity_mode,
  icon_url,
  created_at,
  updated_at
)
SELECT
  b.id,
  b.community_id,
  b.name,
  b.description,
  CASE b.badge_type
    WHEN 'temporary' THEN 'expires_at'
    WHEN 'event' THEN 'expires_at'
    ELSE 'permanent'
  END,
  b.icon_url,
  b.created_at,
  b.created_at
FROM public.badges b
WHERE b.community_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_credentials (
  id,
  credential_id,
  user_id,
  community_id,
  granted_by,
  granted_at,
  expires_at,
  visibility,
  source_type,
  created_at,
  updated_at
)
SELECT
  ub.id,
  ub.badge_id,
  ub.user_id,
  ub.community_id,
  ub.granted_by,
  ub.created_at,
  ub.expires_at,
  'public',
  'legacy_badge',
  ub.created_at,
  ub.created_at
FROM public.user_badges ub
WHERE ub.community_id IS NOT NULL
ON CONFLICT (user_id, credential_id) DO NOTHING;

-- =============================================================================
-- Helpers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.requirement_resolve_community_id(
  p_resource_type public.requirement_resource_type,
  p_resource_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_community_id UUID;
BEGIN
  IF p_resource_type = 'community' THEN
    RETURN p_resource_id;
  END IF;

  IF p_resource_type = 'group' THEN
    SELECT community_id INTO v_community_id
    FROM public.community_groups
    WHERE id = p_resource_id;
    RETURN v_community_id;
  END IF;

  IF p_resource_type = 'event' THEN
    SELECT community_id INTO v_community_id
    FROM public.community_events
    WHERE id = p_resource_id;
    RETURN v_community_id;
  END IF;

  SELECT community_id INTO v_community_id
  FROM public.requirement_sets
  WHERE resource_type = p_resource_type
    AND resource_id = p_resource_id
  LIMIT 1;

  RETURN v_community_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.community_role_rank(p_role public.community_role)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_role
    WHEN 'creator' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    WHEN 'member' THEN 1
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_valid_credential(
  p_user_id UUID,
  p_credential_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_credentials uc
    WHERE uc.user_id = p_user_id
      AND uc.credential_id = p_credential_id
      AND uc.revoked_at IS NULL
      AND (uc.expires_at IS NULL OR uc.expires_at > NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_active_subscription(
  p_user_id UUID,
  p_community_id UUID,
  p_group_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.community_id = p_community_id
      AND s.status IN ('active', 'trialing')
      AND (
        p_group_id IS NULL
        OR s.group_id IS NULL
        OR s.group_id = p_group_id
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_event_ticket(
  p_user_id UUID,
  p_event_id UUID,
  p_require_used BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_tickets et
    WHERE et.user_id = p_user_id
      AND et.event_id = p_event_id
      AND et.status <> 'cancelled'
      AND (NOT p_require_used OR et.status = 'used')
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_group_unlock(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_group_unlocks ugu
    WHERE ugu.user_id = p_user_id
      AND ugu.group_id = p_group_id
  );
$$;

-- =============================================================================
-- Predicate leaf evaluation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.eval_requirement_leaf(
  p_user_id UUID,
  p_predicate_type public.requirement_predicate_type,
  p_predicate_ref_id UUID,
  p_predicate_value TEXT,
  p_resource_type public.requirement_resource_type,
  p_resource_id UUID,
  p_community_id UUID
)
RETURNS TABLE (passed BOOLEAN, predicate_key TEXT, label TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_community UUID;
  v_target_event UUID;
  v_required_role public.community_role;
  v_user_role public.community_role;
  v_group_id UUID;
BEGIN
  IF p_predicate_type = 'credential' AND p_predicate_ref_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      public.user_has_valid_credential(p_user_id, p_predicate_ref_id),
      'credential',
      COALESCE((SELECT name FROM public.credentials WHERE id = p_predicate_ref_id), 'Auszeichnung');
    RETURN;
  END IF;

  IF p_predicate_type = 'membership' THEN
    v_target_community := COALESCE(p_predicate_ref_id, p_community_id);
    RETURN QUERY
    SELECT
      public.is_community_member(v_target_community, p_user_id),
      'membership',
      'Community-Mitgliedschaft';
    RETURN;
  END IF;

  IF p_predicate_type = 'premium' THEN
    v_target_community := COALESCE(p_predicate_ref_id, p_community_id);
    v_group_id := CASE WHEN p_resource_type = 'group' THEN p_resource_id ELSE NULL END;
    RETURN QUERY
    SELECT
      public.user_has_active_subscription(p_user_id, v_target_community, v_group_id),
      'premium',
      'Aktives Premium-Abo';
    RETURN;
  END IF;

  IF p_predicate_type = 'verification' THEN
    RETURN QUERY
    SELECT
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = p_user_id AND p.is_verified = TRUE
      ),
      'verification',
      'Verifiziertes Profil';
    RETURN;
  END IF;

  IF p_predicate_type = 'role' THEN
    v_target_community := COALESCE(p_community_id, public.requirement_resolve_community_id(p_resource_type, p_resource_id));
    v_required_role := COALESCE(p_predicate_value::public.community_role, 'member');
    v_user_role := public.get_community_role(v_target_community, p_user_id);
    RETURN QUERY
    SELECT
      public.community_role_rank(v_user_role) >= public.community_role_rank(v_required_role),
      'role',
      'Rolle: ' || v_required_role::TEXT;
    RETURN;
  END IF;

  IF p_predicate_type = 'ticket' THEN
    v_target_event := COALESCE(
      p_predicate_ref_id,
      CASE WHEN p_resource_type = 'event' THEN p_resource_id ELSE NULL END
    );
    RETURN QUERY
    SELECT
      v_target_event IS NOT NULL
        AND public.user_has_event_ticket(p_user_id, v_target_event, FALSE),
      'ticket',
      'Event-Ticket';
    RETURN;
  END IF;

  IF p_predicate_type = 'collection' AND p_predicate_ref_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      NOT EXISTS (
        SELECT 1
        FROM public.credential_collection_items cci
        WHERE cci.collection_id = p_predicate_ref_id
          AND NOT public.user_has_valid_credential(p_user_id, cci.credential_id)
      )
      AND EXISTS (
        SELECT 1 FROM public.credential_collection_items cci
        WHERE cci.collection_id = p_predicate_ref_id
      ),
      'collection',
      COALESCE((SELECT name FROM public.credential_collections WHERE id = p_predicate_ref_id), 'Sammlung');
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, COALESCE(p_predicate_type::TEXT, 'unknown'), 'Unbekannte Voraussetzung';
END;
$$;

CREATE OR REPLACE FUNCTION public.eval_requirement_node(
  p_user_id UUID,
  p_node_id UUID,
  p_resource_type public.requirement_resource_type,
  p_resource_id UUID,
  p_community_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node public.requirement_nodes%ROWTYPE;
  v_child RECORD;
  v_child_count INTEGER;
  v_passed_count INTEGER;
BEGIN
  SELECT * INTO v_node FROM public.requirement_nodes WHERE id = p_node_id;
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;

  IF v_node.operator = 'LEAF' OR v_node.operator IS NULL THEN
    RETURN (
      SELECT l.passed
      FROM public.eval_requirement_leaf(
        p_user_id,
        v_node.predicate_type,
        v_node.predicate_ref_id,
        v_node.predicate_value,
        p_resource_type,
        p_resource_id,
        p_community_id
      ) l
      LIMIT 1
    );
  END IF;

  SELECT COUNT(*) INTO v_child_count
  FROM public.requirement_nodes
  WHERE parent_id = p_node_id;

  IF v_child_count = 0 THEN
    RETURN TRUE;
  END IF;

  IF v_node.operator = 'AND' THEN
    FOR v_child IN
      SELECT id FROM public.requirement_nodes
      WHERE parent_id = p_node_id
      ORDER BY sort_order
    LOOP
      IF NOT public.eval_requirement_node(
        p_user_id, v_child.id, p_resource_type, p_resource_id, p_community_id
      ) THEN
        RETURN FALSE;
      END IF;
    END LOOP;
    RETURN TRUE;
  END IF;

  IF v_node.operator = 'OR' THEN
    FOR v_child IN
      SELECT id FROM public.requirement_nodes
      WHERE parent_id = p_node_id
      ORDER BY sort_order
    LOOP
      IF public.eval_requirement_node(
        p_user_id, v_child.id, p_resource_type, p_resource_id, p_community_id
      ) THEN
        RETURN TRUE;
      END IF;
    END LOOP;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.collect_requirement_missing(
  p_user_id UUID,
  p_node_id UUID,
  p_resource_type public.requirement_resource_type,
  p_resource_id UUID,
  p_community_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node public.requirement_nodes%ROWTYPE;
  v_child RECORD;
  v_missing JSONB := '[]'::jsonb;
  v_leaf RECORD;
BEGIN
  SELECT * INTO v_node FROM public.requirement_nodes WHERE id = p_node_id;
  IF NOT FOUND THEN
    RETURN v_missing;
  END IF;

  IF v_node.operator = 'LEAF' OR v_node.operator IS NULL THEN
    SELECT * INTO v_leaf
    FROM public.eval_requirement_leaf(
      p_user_id,
      v_node.predicate_type,
      v_node.predicate_ref_id,
      v_node.predicate_value,
      p_resource_type,
      p_resource_id,
      p_community_id
    ) l
    LIMIT 1;

    IF v_leaf.passed IS NOT TRUE THEN
      v_missing := v_missing || jsonb_build_array(
        jsonb_build_object('predicate', v_leaf.predicate_key, 'label', v_leaf.label)
      );
    END IF;
    RETURN v_missing;
  END IF;

  FOR v_child IN
    SELECT id FROM public.requirement_nodes
    WHERE parent_id = p_node_id
    ORDER BY sort_order
  LOOP
    IF v_node.operator = 'AND' THEN
      IF NOT public.eval_requirement_node(
        p_user_id, v_child.id, p_resource_type, p_resource_id, p_community_id
      ) THEN
        v_missing := v_missing || public.collect_requirement_missing(
          p_user_id, v_child.id, p_resource_type, p_resource_id, p_community_id
        );
      END IF;
    ELSIF v_node.operator = 'OR' THEN
      IF public.eval_requirement_node(
        p_user_id, v_child.id, p_resource_type, p_resource_id, p_community_id
      ) THEN
        RETURN v_missing;
      END IF;
    END IF;
  END LOOP;

  IF v_node.operator = 'OR' THEN
    v_missing := v_missing || jsonb_build_array(
      jsonb_build_object('predicate', 'or_group', 'label', 'Mindestens eine Alternative erforderlich')
    );
  END IF;

  RETURN v_missing;
END;
$$;

-- =============================================================================
-- RPC: evaluate_requirements (Phase 1)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.evaluate_requirements(
  p_user_id UUID,
  p_resource_type public.requirement_resource_type,
  p_resource_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_set public.requirement_sets%ROWTYPE;
  v_community_id UUID;
  v_root RECORD;
  v_fulfilled BOOLEAN := TRUE;
  v_missing JSONB := '[]'::jsonb;
  v_has_nodes BOOLEAN := FALSE;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'fulfilled', FALSE,
      'severity', 'required',
      'missing', jsonb_build_array(jsonb_build_object('predicate', 'identity', 'label', 'Nutzer unbekannt')),
      'phase', 1
    );
  END IF;

  SELECT * INTO v_set
  FROM public.requirement_sets
  WHERE resource_type = p_resource_type
    AND resource_id = p_resource_id
    AND is_active = TRUE
  LIMIT 1;

  IF NOT FOUND OR v_set.severity = 'none' THEN
    RETURN jsonb_build_object(
      'fulfilled', TRUE,
      'severity', COALESCE(v_set.severity, 'none'),
      'missing', '[]'::jsonb,
      'phase', 1
    );
  END IF;

  v_community_id := COALESCE(
    v_set.community_id,
    public.requirement_resolve_community_id(p_resource_type, p_resource_id)
  );

  FOR v_root IN
    SELECT id FROM public.requirement_nodes
    WHERE set_id = v_set.id AND parent_id IS NULL
    ORDER BY sort_order
  LOOP
    v_has_nodes := TRUE;
    IF NOT public.eval_requirement_node(
      p_user_id, v_root.id, p_resource_type, p_resource_id, v_community_id
    ) THEN
      v_fulfilled := FALSE;
      v_missing := v_missing || public.collect_requirement_missing(
        p_user_id, v_root.id, p_resource_type, p_resource_id, v_community_id
      );
    END IF;
  END LOOP;

  IF NOT v_has_nodes THEN
    RETURN jsonb_build_object(
      'fulfilled', TRUE,
      'severity', v_set.severity,
      'missing', '[]'::jsonb,
      'phase', 1,
      'note', 'requirement_set_without_nodes'
    );
  END IF;

  RETURN jsonb_build_object(
    'fulfilled', v_fulfilled,
    'severity', v_set.severity,
    'missing', v_missing,
    'phase', 1
  );
END;
$$;

-- =============================================================================
-- RPC: grant_credential + group unlock + check-in rewards
-- =============================================================================

CREATE OR REPLACE FUNCTION public.grant_credential(
  p_credential_id UUID,
  p_user_id UUID,
  p_granted_by UUID DEFAULT auth.uid(),
  p_source_type TEXT DEFAULT NULL,
  p_source_id UUID DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cred public.credentials%ROWTYPE;
  v_grant_id UUID;
BEGIN
  SELECT * INTO v_cred FROM public.credentials WHERE id = p_credential_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auszeichnung nicht gefunden';
  END IF;

  IF p_granted_by IS NOT NULL
     AND NOT public.can_moderate_community(v_cred.community_id, p_granted_by)
     AND p_source_type IS DISTINCT FROM 'event_check_in' THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  INSERT INTO public.user_credentials (
    credential_id,
    user_id,
    community_id,
    granted_by,
    visibility,
    source_type,
    source_id
  )
  VALUES (
    p_credential_id,
    p_user_id,
    v_cred.community_id,
    p_granted_by,
    COALESCE(p_visibility, 'public'),
    p_source_type,
    p_source_id
  )
  ON CONFLICT (user_id, credential_id) DO UPDATE
  SET
    revoked_at = NULL,
    revoked_by = NULL,
    revoke_reason = NULL,
    granted_by = EXCLUDED.granted_by,
    granted_at = NOW(),
    source_type = COALESCE(EXCLUDED.source_type, public.user_credentials.source_type),
    source_id = COALESCE(EXCLUDED.source_id, public.user_credentials.source_id),
    updated_at = NOW()
  RETURNING id INTO v_grant_id;

  RETURN v_grant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_group_for_user(
  p_group_id UUID,
  p_user_id UUID,
  p_source_type TEXT,
  p_source_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group public.community_groups%ROWTYPE;
  v_unlock_id UUID;
BEGIN
  SELECT * INTO v_group FROM public.community_groups WHERE id = p_group_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gruppe nicht gefunden';
  END IF;

  INSERT INTO public.user_group_unlocks (
    user_id, group_id, community_id, source_type, source_id
  )
  VALUES (
    p_user_id, p_group_id, v_group.community_id, p_source_type, p_source_id
  )
  ON CONFLICT ON CONSTRAINT user_group_unlocks_unique DO UPDATE
  SET unlocked_at = NOW()
  RETURNING id INTO v_unlock_id;

  RETURN v_unlock_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_event_check_in_rewards(
  p_event_id UUID,
  p_user_id UUID,
  p_actor_id UUID,
  p_ticket_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.community_events%ROWTYPE;
  v_grant_id UUID;
  v_unlock_id UUID;
BEGIN
  SELECT * INTO v_event FROM public.community_events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('grantedCredential', NULL, 'unlockedGroup', NULL);
  END IF;

  IF v_event.check_in_credential_id IS NOT NULL THEN
    v_grant_id := public.grant_credential(
      v_event.check_in_credential_id,
      p_user_id,
      p_actor_id,
      'event_check_in',
      p_ticket_id,
      'public'
    );
  END IF;

  IF v_event.check_in_group_id IS NOT NULL THEN
    v_unlock_id := public.unlock_group_for_user(
      v_event.check_in_group_id,
      p_user_id,
      'event_check_in',
      p_ticket_id
    );
  END IF;

  RETURN jsonb_build_object(
    'grantedCredential', v_grant_id,
    'unlockedGroup', v_unlock_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_in_event_ticket(
  p_ticket_code TEXT,
  p_actor_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.event_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket
  FROM public.event_tickets
  WHERE ticket_code = p_ticket_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket nicht gefunden';
  END IF;

  IF NOT public.can_manage_community(v_ticket.community_id, p_actor_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  IF v_ticket.status = 'used' THEN
    RAISE EXCEPTION 'Ticket bereits verwendet';
  END IF;

  IF v_ticket.status = 'cancelled' THEN
    RAISE EXCEPTION 'Ticket storniert';
  END IF;

  UPDATE public.event_tickets
  SET status = 'used',
      checked_in_at = NOW(),
      checked_in_by = p_actor_id
  WHERE id = v_ticket.id;

  PERFORM public.apply_event_check_in_rewards(
    v_ticket.event_id,
    v_ticket.user_id,
    p_actor_id,
    v_ticket.id
  );

  RETURN v_ticket.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_credential(UUID, UUID, UUID, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_credential(UUID, UUID, UUID, TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.unlock_group_for_user(UUID, UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_group_for_user(UUID, UUID, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_event_check_in_rewards(UUID, UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_event_check_in_rewards(UUID, UUID, UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.user_has_group_unlock(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_group_unlock(UUID, UUID) TO service_role;
