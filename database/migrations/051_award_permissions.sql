-- Auszeichnungen: granulare Rechte (create_awards, grant_awards) + DB-Enforcement

INSERT INTO public.community_permission_definitions (key, label, description, default_min_role, category)
VALUES
  (
    'create_awards',
    'Auszeichnungen erstellen',
    'Auszeichnungen, Zertifikate und Qualifikationen anlegen oder entfernen',
    'admin',
    'awards'
  ),
  (
    'grant_awards',
    'Auszeichnungen vergeben',
    'Auszeichnungen an Mitglieder vergeben',
    'moderator',
    'awards'
  )
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  default_min_role = EXCLUDED.default_min_role,
  category = EXCLUDED.category;

CREATE OR REPLACE FUNCTION public.community_role_rank(p_role public.community_role)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_role
    WHEN 'member' THEN 0
    WHEN 'verified_member' THEN 0
    WHEN 'moderator' THEN 1
    WHEN 'expert' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'creator' THEN 3
    ELSE -1
  END;
$$;

CREATE OR REPLACE FUNCTION public.has_community_permission(
  p_community_id UUID,
  p_user_id UUID,
  p_permission_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.community_role;
  v_override BOOLEAN;
  v_min_role public.community_role;
BEGIN
  IF p_community_id IS NULL OR p_user_id IS NULL OR p_permission_key IS NULL THEN
    RETURN FALSE;
  END IF;

  v_role := public.get_community_role(p_community_id, p_user_id);
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_role = 'creator' THEN
    RETURN TRUE;
  END IF;

  SELECT o.granted
  INTO v_override
  FROM public.community_permission_overrides o
  WHERE o.community_id = p_community_id
    AND o.permission_key = p_permission_key
    AND o.role = v_role
  LIMIT 1;

  IF FOUND THEN
    RETURN v_override;
  END IF;

  SELECT d.default_min_role
  INTO v_min_role
  FROM public.community_permission_definitions d
  WHERE d.key = p_permission_key;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN public.community_role_rank(v_role) >= public.community_role_rank(v_min_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.community_role_rank(public.community_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_community_permission(UUID, UUID, TEXT) TO authenticated, service_role;

-- Vergabe: grant_awards (Event-Check-in ausgenommen)
CREATE OR REPLACE FUNCTION public.grant_credential(
  p_credential_id UUID,
  p_user_id UUID,
  p_granted_by UUID DEFAULT auth.uid(),
  p_source_type TEXT DEFAULT NULL,
  p_source_id UUID DEFAULT NULL,
  p_visibility TEXT DEFAULT 'private'
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
     AND p_source_type IS DISTINCT FROM 'event_check_in'
     AND NOT public.has_community_permission(v_cred.community_id, p_granted_by, 'grant_awards') THEN
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
    COALESCE(p_visibility, 'private'),
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

DROP POLICY IF EXISTS "credentials_manage_community" ON public.credentials;

CREATE POLICY "credentials_manage_create_awards"
  ON public.credentials FOR ALL
  USING (public.has_community_permission(community_id, auth.uid(), 'create_awards'))
  WITH CHECK (public.has_community_permission(community_id, auth.uid(), 'create_awards'));
