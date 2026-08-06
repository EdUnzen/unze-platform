-- Phase 0: UNZE-ID + Requirement-Engine + Credential skeleton (UNZE-003/004/005)
-- Business logic intentionally minimal � schema + RPC stubs only.

-- =============================================================================
-- UNZE public identity token (one per user)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.generate_unze_public_id()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public, extensions
AS $$
  SELECT 'UZ' || encode(extensions.gen_random_bytes(16), 'hex');
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS unze_public_id TEXT;

UPDATE public.profiles
SET unze_public_id = public.generate_unze_public_id()
WHERE unze_public_id IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN unze_public_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unze_public_id
  ON public.profiles(unze_public_id);

-- New users receive token on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, unze_public_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    public.generate_unze_public_id()
  );
  RETURN NEW;
END;
$$;

-- =============================================================================
-- Requirement-Engine skeleton
-- =============================================================================

CREATE TYPE public.requirement_severity AS ENUM ('none', 'recommended', 'required');

CREATE TYPE public.requirement_resource_type AS ENUM (
  'community',
  'group',
  'event',
  'service',
  'course',
  'product',
  'tournament',
  'premium_content'
);

CREATE TYPE public.requirement_predicate_type AS ENUM (
  'credential',
  'membership',
  'premium',
  'verification',
  'role',
  'ticket',
  'collection'
);

CREATE TABLE IF NOT EXISTS public.requirement_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  resource_type public.requirement_resource_type NOT NULL,
  resource_id UUID NOT NULL,
  severity public.requirement_severity NOT NULL DEFAULT 'none',
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT requirement_sets_resource_unique UNIQUE (resource_type, resource_id)
);

CREATE TABLE IF NOT EXISTS public.requirement_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.requirement_sets(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.requirement_nodes(id) ON DELETE CASCADE,
  operator TEXT CHECK (operator IN ('AND', 'OR', 'LEAF')),
  predicate_type public.requirement_predicate_type,
  predicate_ref_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requirement_sets_resource
  ON public.requirement_sets(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_requirement_nodes_set
  ON public.requirement_nodes(set_id, sort_order);

-- =============================================================================
-- Credential skeleton (UNZE-003)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  validity_mode TEXT NOT NULL DEFAULT 'permanent'
    CHECK (validity_mode IN ('permanent', 'expires_at', 'renewal')),
  default_validity_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private', 'archived')),
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  revoke_reason TEXT,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_credentials_unique UNIQUE (user_id, credential_id)
);

CREATE TABLE IF NOT EXISTS public.credential_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credential_collection_items (
  collection_id UUID NOT NULL REFERENCES public.credential_collections(id) ON DELETE CASCADE,
  credential_id UUID NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, credential_id)
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user
  ON public.user_credentials(user_id, community_id);

-- =============================================================================
-- UNZE-ID verify audit log
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.unze_id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resource_type public.requirement_resource_type NOT NULL,
  resource_id UUID NOT NULL,
  result_code TEXT NOT NULL,
  allowed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unze_id_verifications_subject
  ON public.unze_id_verifications(subject_user_id, created_at DESC);

-- =============================================================================
-- RLS (skeleton � community-scoped where applicable)
-- =============================================================================

ALTER TABLE public.requirement_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unze_id_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own unze_public_id
DROP POLICY IF EXISTS "profiles_select_own_unze_id" ON public.profiles;
-- existing profile policies cover SELECT; no change needed

CREATE POLICY "requirement_nodes_select"
  ON public.requirement_nodes FOR SELECT
  USING (TRUE);

CREATE POLICY "requirement_nodes_manage"
  ON public.requirement_nodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.requirement_sets rs
      WHERE rs.id = set_id
        AND (rs.community_id IS NULL OR public.can_manage_community(rs.community_id))
    )
  );

CREATE POLICY "credential_collections_select"
  ON public.credential_collections FOR SELECT
  USING (TRUE);

CREATE POLICY "credential_collections_manage"
  ON public.credential_collections FOR ALL
  USING (public.can_manage_community(community_id));

CREATE POLICY "credential_collection_items_select"
  ON public.credential_collection_items FOR SELECT
  USING (TRUE);

CREATE POLICY "credential_collection_items_manage"
  ON public.credential_collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.credential_collections cc
      WHERE cc.id = collection_id
        AND public.can_manage_community(cc.community_id)
    )
  );

CREATE POLICY "requirement_sets_select_community"
  ON public.requirement_sets FOR SELECT
  USING (TRUE);

CREATE POLICY "requirement_sets_manage_community"
  ON public.requirement_sets FOR ALL
  USING (community_id IS NULL OR public.can_manage_community(community_id));

CREATE POLICY "credentials_select_community"
  ON public.credentials FOR SELECT
  USING (TRUE);

CREATE POLICY "credentials_manage_community"
  ON public.credentials FOR ALL
  USING (public.can_manage_community(community_id));

CREATE POLICY "user_credentials_select_own"
  ON public.user_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_credentials_select_manage"
  ON public.user_credentials FOR SELECT
  USING (public.can_manage_community(community_id));

CREATE POLICY "user_credentials_manage_community"
  ON public.user_credentials FOR ALL
  USING (public.can_manage_community(community_id));

CREATE POLICY "unze_id_verifications_insert_manage"
  ON public.unze_id_verifications FOR INSERT
  WITH CHECK (actor_id IS NULL OR actor_id = auth.uid());

CREATE POLICY "unze_id_verifications_select_manage"
  ON public.unze_id_verifications FOR SELECT
  USING (
    subject_user_id = auth.uid()
    OR actor_id = auth.uid()
  );

GRANT SELECT ON public.requirement_sets TO authenticated;
GRANT SELECT ON public.requirement_nodes TO authenticated;
GRANT SELECT ON public.credentials TO authenticated;
GRANT SELECT ON public.user_credentials TO authenticated;
GRANT INSERT ON public.unze_id_verifications TO authenticated;
GRANT SELECT ON public.unze_id_verifications TO authenticated;
GRANT ALL ON public.requirement_sets TO service_role;
GRANT ALL ON public.requirement_nodes TO service_role;
GRANT ALL ON public.credentials TO service_role;
GRANT ALL ON public.user_credentials TO service_role;
GRANT ALL ON public.credential_collections TO service_role;
GRANT ALL ON public.credential_collection_items TO service_role;
GRANT ALL ON public.unze_id_verifications TO service_role;

-- =============================================================================
-- RPC: resolve identity
-- =============================================================================

CREATE OR REPLACE FUNCTION public.resolve_unze_public_id(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_normalized TEXT;
BEGIN
  v_normalized := NULLIF(trim(both FROM p_token), '');
  IF v_normalized IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_normalized LIKE 'UNZEID:%' THEN
    v_normalized := substring(v_normalized FROM 8);
  END IF;
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE unze_public_id = v_normalized
  LIMIT 1;
  RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_unze_public_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_unze_public_id(TEXT) TO service_role;

-- =============================================================================
-- RPC: evaluate_requirements (Phase 0 stub)
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
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'fulfilled', FALSE,
      'severity', 'required',
      'missing', jsonb_build_array(jsonb_build_object('predicate', 'identity', 'label', 'Nutzer unbekannt'))
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
      'missing', '[]'::jsonb
    );
  END IF;

  -- Phase 0: no predicate evaluation yet � report as pending engine wiring
  RETURN jsonb_build_object(
    'fulfilled', TRUE,
    'severity', v_set.severity,
    'missing', '[]'::jsonb,
    'phase', 0,
    'note', 'requirement_set_present_predicate_evaluation_pending'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_requirements(UUID, public.requirement_resource_type, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_requirements(UUID, public.requirement_resource_type, UUID) TO service_role;

-- =============================================================================
-- RPC: verify_unze_id (Phase 0 � identity + stub evaluation + audit)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.verify_unze_id(
  p_token TEXT,
  p_resource_type public.requirement_resource_type,
  p_resource_id UUID,
  p_actor_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_eval JSONB;
  v_allowed BOOLEAN;
  v_result_code TEXT;
  v_community_id UUID;
BEGIN
  v_user_id := public.resolve_unze_public_id(p_token);
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', FALSE, 'result_code', 'identity_not_found');
  END IF;

  v_eval := public.evaluate_requirements(v_user_id, p_resource_type, p_resource_id);
  v_allowed := COALESCE((v_eval->>'fulfilled')::boolean, FALSE);
  v_result_code := CASE WHEN v_allowed THEN 'allowed' ELSE 'denied' END;

  SELECT community_id INTO v_community_id
  FROM public.requirement_sets
  WHERE resource_type = p_resource_type AND resource_id = p_resource_id
  LIMIT 1;

  IF v_community_id IS NOT NULL AND p_actor_id IS NOT NULL THEN
    IF NOT public.can_manage_community(v_community_id, p_actor_id) THEN
      RETURN jsonb_build_object('allowed', FALSE, 'result_code', 'scanner_not_authorized');
    END IF;
  END IF;

  INSERT INTO public.unze_id_verifications (
    subject_user_id, actor_id, resource_type, resource_id, result_code, allowed
  ) VALUES (
    v_user_id, p_actor_id, p_resource_type, p_resource_id, v_result_code, v_allowed
  );

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'result_code', v_result_code,
    'severity', v_eval->>'severity'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_unze_id(TEXT, public.requirement_resource_type, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_unze_id(TEXT, public.requirement_resource_type, UUID, UUID) TO service_role;
