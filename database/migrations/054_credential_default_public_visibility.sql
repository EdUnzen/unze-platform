-- Auszeichnungen standardmäßig in Community sichtbar (Nutzer kann auf privat stellen)

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
    source_id,
    snapshot_name,
    snapshot_description,
    snapshot_icon_url
  )
  VALUES (
    p_credential_id,
    p_user_id,
    v_cred.community_id,
    p_granted_by,
    COALESCE(p_visibility, 'public'),
    p_source_type,
    p_source_id,
    v_cred.name,
    v_cred.description,
    v_cred.icon_url
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
    snapshot_name = EXCLUDED.snapshot_name,
    snapshot_description = EXCLUDED.snapshot_description,
    snapshot_icon_url = EXCLUDED.snapshot_icon_url,
    updated_at = NOW()
  RETURNING id INTO v_grant_id;

  RETURN v_grant_id;
END;
$$;

COMMENT ON FUNCTION public.grant_credential IS
  'Verleiht Auszeichnung. Standard-Sichtbarkeit: public (Community + Profil, Opt-out möglich).';
