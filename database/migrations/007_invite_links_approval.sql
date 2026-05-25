-- UNZE Invite Links & Extended Join/Approval System
-- Nach 006_community_access_governance.sql ausführen

-- =============================================================================
-- Community Access Mode (Creator-Presets)
-- =============================================================================
CREATE TYPE public.community_access_mode AS ENUM (
  'open',
  'private',
  'closed',
  'invite_only',
  'premium'
);

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS access_mode public.community_access_mode NOT NULL DEFAULT 'open';

-- Antrag-Quelle & Einladungsbezug
ALTER TABLE public.community_join_applications
  ADD COLUMN IF NOT EXISTS invite_link_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'application';

-- =============================================================================
-- Einladungslinks
-- =============================================================================
CREATE TABLE public.community_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_role public.community_role NOT NULL DEFAULT 'member',
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  is_single_use BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  bypass_closed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invite_links_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT invite_links_assigned_role_not_creator CHECK (assigned_role <> 'creator')
);

CREATE INDEX idx_invite_links_community
  ON public.community_invite_links(community_id, is_active);

CREATE INDEX idx_invite_links_code
  ON public.community_invite_links(code)
  WHERE is_active = TRUE;

ALTER TABLE public.community_join_applications
  ADD CONSTRAINT join_applications_invite_fk
  FOREIGN KEY (invite_link_id) REFERENCES public.community_invite_links(id) ON DELETE SET NULL;

-- =============================================================================
-- Einlösungen (Audit + einmalige Links)
-- =============================================================================
CREATE TABLE public.community_invite_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_link_id UUID NOT NULL REFERENCES public.community_invite_links(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_role public.community_role NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (invite_link_id, user_id)
);

CREATE INDEX idx_invite_redemptions_community
  ON public.community_invite_redemptions(community_id);

-- =============================================================================
-- Hilfsfunktionen: Einladung validieren
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_invite_link_by_code(
  p_code TEXT
)
RETURNS public.community_invite_links
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.community_invite_links
  WHERE code = p_code
    AND is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_invite_link_valid(
  p_invite public.community_invite_links,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_invite IS NULL THEN
    RETURN 'Einladungslink ungültig';
  END IF;

  IF NOT p_invite.is_active THEN
    RETURN 'Einladungslink deaktiviert';
  END IF;

  IF p_invite.expires_at IS NOT NULL AND p_invite.expires_at < NOW() THEN
    RETURN 'Einladungslink abgelaufen';
  END IF;

  IF p_invite.is_single_use AND p_invite.use_count >= 1 THEN
    RETURN 'Einladungslink bereits verwendet';
  END IF;

  IF p_invite.max_uses IS NOT NULL AND p_invite.use_count >= p_invite.max_uses THEN
    RETURN 'Einladungslink ausgeschöpft';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.community_invite_redemptions r
    WHERE r.invite_link_id = p_invite.id AND r.user_id = p_user_id
  ) THEN
    RETURN 'Du hast diesen Link bereits eingelöst';
  END IF;

  IF public.is_community_member(p_invite.community_id, p_user_id) THEN
    RETURN NULL;
  END IF;

  IF public.is_community_at_member_limit(p_invite.community_id) THEN
    RETURN 'Mitgliederlimit erreicht';
  END IF;

  RETURN NULL;
END;
$$;

-- Einladung einlösen (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.redeem_community_invite(
  p_code TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.community_invite_links;
  v_community public.communities;
  v_error TEXT;
  v_role public.community_role;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet';
  END IF;

  SELECT * INTO v_invite FROM public.get_invite_link_by_code(p_code) FOR UPDATE;
  v_error := public.is_invite_link_valid(v_invite, p_user_id);

  IF v_error IS NOT NULL THEN
    IF v_error = 'Du hast diesen Link bereits eingelöst' OR public.is_community_member(v_invite.community_id, p_user_id) THEN
      SELECT slug INTO v_community FROM public.communities WHERE id = v_invite.community_id;
      RETURN jsonb_build_object(
        'status', 'already_member',
        'community_id', v_invite.community_id,
        'slug', (SELECT slug FROM public.communities WHERE id = v_invite.community_id)
      );
    END IF;
    RAISE EXCEPTION '%', v_error;
  END IF;

  SELECT * INTO v_community FROM public.communities WHERE id = v_invite.community_id;

  IF NOT v_invite.bypass_closed THEN
    IF v_community.access_status IN ('closed', 'paused')
       OR v_community.admissions_paused THEN
      RAISE EXCEPTION 'Community aktuell nicht erreichbar';
    END IF;
  END IF;

  IF v_community.visibility = 'premium'
     AND v_community.monetization_enabled THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.community_id = v_invite.community_id
        AND s.user_id = p_user_id
        AND s.status IN ('active', 'trialing')
    ) THEN
      RAISE EXCEPTION 'Kostenpflichtiger Zugang — Abo erforderlich';
    END IF;
  END IF;

  v_role := v_invite.assigned_role;
  IF v_role = 'creator' THEN
    v_role := 'member';
  END IF;

  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (v_invite.community_id, p_user_id, v_role)
  ON CONFLICT (community_id, user_id) DO NOTHING;

  INSERT INTO public.community_invite_redemptions (
    invite_link_id, community_id, user_id, assigned_role
  ) VALUES (
    v_invite.id, v_invite.community_id, p_user_id, v_role
  )
  ON CONFLICT (invite_link_id, user_id) DO NOTHING;

  UPDATE public.community_invite_links
  SET use_count = use_count + 1, updated_at = NOW()
  WHERE id = v_invite.id;

  IF v_invite.is_single_use OR (v_invite.max_uses IS NOT NULL AND v_invite.use_count + 1 >= v_invite.max_uses) THEN
    UPDATE public.community_invite_links
    SET is_active = FALSE
    WHERE id = v_invite.id;
  END IF;

  RETURN jsonb_build_object(
    'status', 'joined',
    'community_id', v_invite.community_id,
    'slug', v_community.slug,
    'role', v_role::TEXT
  );
END;
$$;

-- Warteliste: ältesten Antrag annehmen wenn Platz frei
CREATE OR REPLACE FUNCTION public.promote_next_waitlisted_application(
  p_community_id UUID,
  p_reviewer_id UUID DEFAULT auth.uid()
)
RETURNS public.community_join_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app public.community_join_applications;
BEGIN
  IF NOT public.can_moderate_community(p_community_id, p_reviewer_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  IF public.is_community_at_member_limit(p_community_id) THEN
    RAISE EXCEPTION 'Mitgliederlimit erreicht';
  END IF;

  SELECT * INTO v_app
  FROM public.community_join_applications
  WHERE community_id = p_community_id
    AND status = 'waitlisted'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  PERFORM public.accept_join_application(v_app.id, p_reviewer_id);
  SELECT * INTO v_app FROM public.community_join_applications WHERE id = v_app.id;
  RETURN v_app;
END;
$$;

-- =============================================================================
-- Triggers
-- =============================================================================
CREATE TRIGGER community_invite_links_updated_at
  BEFORE UPDATE ON public.community_invite_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invite_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_links_select_managers"
  ON public.community_invite_links FOR SELECT
  USING (public.can_manage_community(community_id));

CREATE POLICY "invite_links_manage"
  ON public.community_invite_links FOR ALL
  USING (public.can_manage_community(community_id))
  WITH CHECK (
    public.can_manage_community(community_id)
    AND assigned_role <> 'creator'
  );

CREATE POLICY "invite_links_select_active_public"
  ON public.community_invite_links FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "invite_redemptions_select"
  ON public.community_invite_redemptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_moderate_community(community_id)
  );

CREATE POLICY "invite_redemptions_insert_system"
  ON public.community_invite_redemptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Notifications für Creator bei neuen Anträgen (Insert via Service)
