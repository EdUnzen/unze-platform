-- Beta finalization: requirement satisfied preview + credential categories

-- =============================================================================
-- Credential categories (UNZE-003 extensible)
-- =============================================================================

DO $$
BEGIN
  CREATE TYPE public.credential_category AS ENUM (
    'certificate',
    'community_award',
    'group_award',
    'event_award',
    'course_award',
    'service_award',
    'product_award',
    'verification',
    'achievement',
    'legacy'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS category public.credential_category NOT NULL DEFAULT 'community_award';

UPDATE public.credentials
SET category = 'legacy'
WHERE category = 'community_award'
  AND EXISTS (
    SELECT 1 FROM public.user_credentials uc
    WHERE uc.credential_id = credentials.id
      AND uc.source_type = 'legacy_badge'
  );

-- =============================================================================
-- Requirement evaluation: satisfied + missing leaf lists for member preview
-- =============================================================================

CREATE OR REPLACE FUNCTION public.collect_requirement_leaf_status(
  p_user_id UUID,
  p_set_id UUID,
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
  v_leaf public.requirement_nodes%ROWTYPE;
  v_eval RECORD;
  v_satisfied JSONB := '[]'::jsonb;
  v_missing JSONB := '[]'::jsonb;
BEGIN
  FOR v_leaf IN
    SELECT *
    FROM public.requirement_nodes
    WHERE set_id = p_set_id
      AND predicate_type IS NOT NULL
    ORDER BY sort_order
  LOOP
    SELECT * INTO v_eval
    FROM public.eval_requirement_leaf(
      p_user_id,
      v_leaf.predicate_type,
      v_leaf.predicate_ref_id,
      v_leaf.predicate_value,
      p_resource_type,
      p_resource_id,
      p_community_id
    ) l
    LIMIT 1;

    IF COALESCE(v_eval.passed, FALSE) THEN
      v_satisfied := v_satisfied || jsonb_build_array(
        jsonb_build_object('predicate', v_eval.predicate_key, 'label', v_eval.label)
      );
    ELSE
      v_missing := v_missing || jsonb_build_array(
        jsonb_build_object('predicate', v_eval.predicate_key, 'label', v_eval.label)
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('satisfied', v_satisfied, 'missing', v_missing);
END;
$$;

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
  v_satisfied JSONB := '[]'::jsonb;
  v_status JSONB;
  v_has_nodes BOOLEAN := FALSE;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'fulfilled', FALSE,
      'severity', 'required',
      'missing', jsonb_build_array(jsonb_build_object('predicate', 'identity', 'label', 'Nutzer unbekannt')),
      'satisfied', '[]'::jsonb,
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
      'satisfied', '[]'::jsonb,
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

  IF v_has_nodes THEN
    v_status := public.collect_requirement_leaf_status(
      p_user_id, v_set.id, p_resource_type, p_resource_id, v_community_id
    );
    v_satisfied := COALESCE(v_status->'satisfied', '[]'::jsonb);
    IF v_fulfilled THEN
      v_missing := COALESCE(v_status->'missing', '[]'::jsonb);
    ELSE
      v_missing := COALESCE(v_status->'missing', v_missing);
    END IF;
  END IF;

  IF NOT v_has_nodes THEN
    RETURN jsonb_build_object(
      'fulfilled', TRUE,
      'severity', v_set.severity,
      'missing', '[]'::jsonb,
      'satisfied', '[]'::jsonb,
      'phase', 1,
      'note', 'requirement_set_without_nodes'
    );
  END IF;

  RETURN jsonb_build_object(
    'fulfilled', v_fulfilled,
    'severity', v_set.severity,
    'missing', v_missing,
    'satisfied', v_satisfied,
    'phase', 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.collect_requirement_leaf_status(UUID, UUID, public.requirement_resource_type, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.collect_requirement_leaf_status(UUID, UUID, public.requirement_resource_type, UUID, UUID) TO service_role;
