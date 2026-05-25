-- UNZE Migration Part 2/3
-- Nacheinander part1 → part2 → part3 ausführen

-- ========== 006_community_access_governance.sql ==========
-- UNZE Community Access & Governance System
-- Kernmodul: Zugangsstatus, Beitrittsanträge, Fragen, Plattform-IDs, Rollen
-- Nach 005_dashboard_member_access.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.community_access_status AS ENUM (
  'open',
  'closed',
  'paused',
  'invite_only',
  'member_limit_reached'
);

CREATE TYPE public.join_approval_mode AS ENUM (
  'auto_accept',
  'manual_review',
  'auto_reject',
  'waitlist'
);

CREATE TYPE public.join_question_type AS ENUM (
  'text',
  'checkbox',
  'rules_consent',
  'age_verification'
);

CREATE TYPE public.platform_identity_type AS ENUM (
  'discord',
  'whatsapp',
  'telegram',
  'facebook',
  'psn',
  'epic',
  'phone',
  'linkedin',
  'instagram',
  'x',
  'tiktok',
  'other'
);

CREATE TYPE public.join_application_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'waitlisted',
  'withdrawn'
);

-- verified_member Rolle (Owner = creator, bereits vorhanden)
ALTER TYPE public.community_role ADD VALUE IF NOT EXISTS 'verified_member';

-- =============================================================================
-- Communities: Access-Einstellungen
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS access_status public.community_access_status NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS admissions_paused BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS member_limit INTEGER,
  ADD COLUMN IF NOT EXISTS join_approval_mode public.join_approval_mode NOT NULL DEFAULT 'auto_accept',
  ADD COLUMN IF NOT EXISTS community_rules TEXT,
  ADD COLUMN IF NOT EXISTS require_rules_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS require_age_verification BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS min_age INTEGER,
  ADD COLUMN IF NOT EXISTS required_platform_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.communities
  ADD CONSTRAINT communities_member_limit_positive
    CHECK (member_limit IS NULL OR member_limit > 0);

ALTER TABLE public.communities
  ADD CONSTRAINT communities_min_age_range
    CHECK (min_age IS NULL OR (min_age >= 13 AND min_age <= 120));

CREATE INDEX IF NOT EXISTS idx_communities_access_status
  ON public.communities(access_status);

-- =============================================================================
-- Beitrittsfragen (Creator-definiert)
-- =============================================================================
CREATE TABLE public.community_join_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  question_type public.join_question_type NOT NULL DEFAULT 'text',
  label TEXT NOT NULL,
  placeholder TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_join_questions_community
  ON public.community_join_questions(community_id, sort_order);

-- =============================================================================
-- Beitrittsanträge
-- =============================================================================
CREATE TABLE public.community_join_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.join_application_status NOT NULL DEFAULT 'pending',
  system_message TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX idx_join_applications_community_status
  ON public.community_join_applications(community_id, status);

CREATE INDEX idx_join_applications_user
  ON public.community_join_applications(user_id);

-- =============================================================================
-- Antworten auf Beitrittsfragen
-- =============================================================================
CREATE TABLE public.community_join_application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.community_join_applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.community_join_questions(id) ON DELETE SET NULL,
  value_text TEXT,
  value_boolean BOOLEAN,
  value_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_join_answers_application
  ON public.community_join_application_answers(application_id);

-- =============================================================================
-- Plattform-Identitäten im Antrag (Discord, PSN, etc.)
-- =============================================================================
CREATE TABLE public.community_join_platform_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.community_join_applications(id) ON DELETE CASCADE,
  platform_type public.platform_identity_type NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, platform_type)
);

CREATE INDEX idx_join_platform_identities_application
  ON public.community_join_platform_identities(application_id);

-- =============================================================================
-- Hilfsfunktionen: Mitgliedslimit & Zugangsprüfung
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_community_at_member_limit(
  p_community_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = p_community_id
      AND c.member_limit IS NOT NULL
      AND c.member_count >= c.member_limit
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_community_access_status_on_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_community_id UUID;
  v_at_limit BOOLEAN;
BEGIN
  v_community_id := COALESCE(NEW.community_id, OLD.community_id);
  v_at_limit := public.is_community_at_member_limit(v_community_id);

  IF v_at_limit THEN
    UPDATE public.communities
    SET access_status = 'member_limit_reached'
    WHERE id = v_community_id
      AND access_status NOT IN ('closed', 'invite_only');
  ELSE
    UPDATE public.communities
    SET access_status = 'open'
    WHERE id = v_community_id
      AND access_status = 'member_limit_reached';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER community_members_access_status
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_access_status_on_count();

CREATE OR REPLACE FUNCTION public.community_has_join_questions(
  p_community_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_join_questions q
    WHERE q.community_id = p_community_id
      AND q.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_join_block_reason(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c RECORD;
BEGIN
  SELECT
    c.visibility,
    c.access_status,
    c.admissions_paused,
    c.join_approval_mode,
    c.monetization_enabled
  INTO v_c
  FROM public.communities c
  WHERE c.id = p_community_id;

  IF NOT FOUND THEN
    RETURN 'Community nicht gefunden';
  END IF;

  IF public.is_community_member(p_community_id, p_user_id) THEN
    RETURN NULL;
  END IF;

  IF v_c.access_status = 'closed' THEN
    RETURN 'Community aktuell geschlossen';
  END IF;

  IF v_c.admissions_paused OR v_c.access_status = 'paused' THEN
    RETURN 'Weitere Bewerbungen aktuell pausiert';
  END IF;

  IF public.is_community_at_member_limit(p_community_id) THEN
    RETURN 'Mitgliederlimit erreicht';
  END IF;

  IF v_c.visibility = 'premium' AND v_c.monetization_enabled THEN
    RETURN 'Kostenpflichtiger Zugang — Abo erforderlich';
  END IF;

  IF v_c.visibility = 'private' OR v_c.access_status = 'invite_only' THEN
    IF v_c.join_approval_mode = 'auto_reject' THEN
      RETURN 'Nur auf Einladung — Beitritt nicht möglich';
    END IF;
    RETURN NULL;
  END IF;

  IF v_c.join_approval_mode = 'auto_reject' THEN
    RETURN 'Beitritt derzeit nicht möglich';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_direct_join_community(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c RECORD;
BEGIN
  IF public.get_join_block_reason(p_community_id, p_user_id) IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  SELECT c.visibility, c.join_approval_mode
  INTO v_c
  FROM public.communities c
  WHERE c.id = p_community_id;

  IF v_c.join_approval_mode <> 'auto_accept' THEN
    RETURN FALSE;
  END IF;

  IF public.community_has_join_questions(p_community_id) THEN
    RETURN FALSE;
  END IF;

  IF v_c.visibility NOT IN ('public', 'premium') THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Antrag annehmen und Mitglied hinzufügen (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.accept_join_application(
  p_application_id UUID,
  p_reviewer_id UUID DEFAULT auth.uid()
)
RETURNS public.community_join_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app public.community_join_applications;
  v_block TEXT;
BEGIN
  SELECT * INTO v_app
  FROM public.community_join_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Antrag nicht gefunden';
  END IF;

  IF v_app.status NOT IN ('pending', 'waitlisted') THEN
    RAISE EXCEPTION 'Antrag kann nicht mehr bearbeitet werden';
  END IF;

  IF NOT public.can_moderate_community(v_app.community_id, p_reviewer_id)
     AND NOT public.can_manage_community(v_app.community_id, p_reviewer_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  v_block := public.get_join_block_reason(v_app.community_id, v_app.user_id);
  IF v_block IS NOT NULL AND v_block <> 'Mitgliederlimit erreicht' THEN
    RAISE EXCEPTION '%', v_block;
  END IF;

  IF public.is_community_at_member_limit(v_app.community_id) THEN
    RAISE EXCEPTION 'Mitgliederlimit erreicht';
  END IF;

  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (v_app.community_id, v_app.user_id, 'member')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  UPDATE public.community_join_applications
  SET
    status = 'accepted',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    system_message = 'Antrag angenommen',
    updated_at = NOW()
  WHERE id = p_application_id
  RETURNING * INTO v_app;

  RETURN v_app;
END;
$$;

-- =============================================================================
-- Triggers: updated_at
-- =============================================================================
CREATE TRIGGER community_join_questions_updated_at
  BEFORE UPDATE ON public.community_join_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER community_join_applications_updated_at
  BEFORE UPDATE ON public.community_join_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_join_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_platform_identities ENABLE ROW LEVEL SECURITY;

-- Fragen: öffentlich lesbar wenn Community sichtbar; Verwalten nur Admin+
CREATE POLICY "join_questions_select"
  ON public.community_join_questions FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "join_questions_manage"
  ON public.community_join_questions FOR ALL
  USING (public.can_manage_community(community_id))
  WITH CHECK (public.can_manage_community(community_id));

-- Anträge: eigene lesen; Moderator+ lesen/bearbeiten; User erstellen
CREATE POLICY "join_applications_select_own"
  ON public.community_join_applications FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_moderate_community(community_id)
  );

CREATE POLICY "join_applications_insert_own"
  ON public.community_join_applications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND NOT public.is_community_member(community_id)
  );

CREATE POLICY "join_applications_update_moderator"
  ON public.community_join_applications FOR UPDATE
  USING (public.can_moderate_community(community_id))
  WITH CHECK (public.can_moderate_community(community_id));

CREATE POLICY "join_applications_update_own_withdraw"
  ON public.community_join_applications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND status = 'withdrawn');

-- Antworten
CREATE POLICY "join_answers_select"
  ON public.community_join_application_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_answers_insert_own"
  ON public.community_join_application_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Plattform-Identitäten
CREATE POLICY "join_platform_identities_select"
  ON public.community_join_platform_identities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_platform_identities_insert_own"
  ON public.community_join_platform_identities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Community-Mitglieder: erweiterte Join-Policy
DROP POLICY IF EXISTS "community_members_insert_join" ON public.community_members;

CREATE POLICY "community_members_insert_join"
  ON public.community_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role IN ('member', 'verified_member')
    AND public.can_direct_join_community(community_id, auth.uid())
  );

-- Notifications: Moderator+ können Systemnachrichten für Anträge erstellen
CREATE POLICY "notifications_insert_system"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.user_id = auth.uid()
          AND cm.role IN ('creator', 'admin', 'moderator')
      )
    )
  );



-- ========== 007_invite_links_approval.sql ==========
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



-- ========== 008_community_lifecycle.sql ==========
-- UNZE Community Lifecycle System
-- Status: archiviert, Warteliste, Bann/Rejoin-Schutz, Datei-Nachweise, Creator-Optionen
-- Nach 007_invite_links_approval.sql ausführen

-- =============================================================================
-- Enum-Erweiterungen
-- =============================================================================
ALTER TYPE public.community_access_status ADD VALUE IF NOT EXISTS 'archived';

ALTER TYPE public.join_question_type ADD VALUE IF NOT EXISTS 'file_upload';
ALTER TYPE public.join_question_type ADD VALUE IF NOT EXISTS 'image_upload';

CREATE TYPE public.community_restriction_type AS ENUM (
  'ban',
  'cooldown',
  'removed_block'
);

-- =============================================================================
-- Lifecycle-Einstellungen auf communities
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_reject_at_limit BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS auto_messages_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS rejoin_cooldown_days INTEGER,
  ADD COLUMN IF NOT EXISTS allow_rejoin_after_ban BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS paid_join_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lifecycle_notes TEXT;

ALTER TABLE public.communities
  ADD CONSTRAINT communities_rejoin_cooldown_positive
    CHECK (rejoin_cooldown_days IS NULL OR rejoin_cooldown_days >= 0);

-- =============================================================================
-- Rejoin-Schutz / Bann-System
-- =============================================================================
CREATE TABLE public.community_member_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restriction_type public.community_restriction_type NOT NULL,
  reason TEXT,
  restricted_until TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_restrictions_community
  ON public.community_member_restrictions(community_id, user_id);

CREATE UNIQUE INDEX idx_member_restrictions_active_ban
  ON public.community_member_restrictions(community_id, user_id)
  WHERE lifted_at IS NULL AND restriction_type = 'ban';

-- =============================================================================
-- Datei-/Bildnachweise für Bewerbungen (Storage-Vorbereitung)
-- =============================================================================
CREATE TABLE public.community_join_application_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.community_join_applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.community_join_questions(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes INTEGER CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  storage_bucket TEXT DEFAULT 'community-join-proofs',
  storage_path TEXT,
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_join_application_files_app
  ON public.community_join_application_files(application_id);

-- =============================================================================
-- Hilfsfunktionen
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_user_restricted_from_community(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_r RECORD;
BEGIN
  SELECT restriction_type, reason, restricted_until
  INTO v_r
  FROM public.community_member_restrictions
  WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND lifted_at IS NULL
    AND (
      restricted_until IS NULL
      OR restricted_until > NOW()
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_r.restriction_type = 'ban' THEN
    RETURN COALESCE(v_r.reason, 'Du bist von dieser Community ausgeschlossen');
  END IF;

  IF v_r.restriction_type = 'cooldown' THEN
    RETURN COALESCE(v_r.reason, 'Rejoin-Schutz aktiv — bitte später erneut versuchen');
  END IF;

  RETURN COALESCE(v_r.reason, 'Beitritt derzeit nicht möglich');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_join_block_reason(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c RECORD;
  v_restriction TEXT;
BEGIN
  SELECT
    c.visibility,
    c.access_status,
    c.admissions_paused,
    c.join_approval_mode,
    c.monetization_enabled,
    c.paid_join_required,
    c.waitlist_enabled,
    c.auto_reject_at_limit
  INTO v_c
  FROM public.communities c
  WHERE c.id = p_community_id;

  IF NOT FOUND THEN
    RETURN 'Community nicht gefunden';
  END IF;

  IF public.is_community_member(p_community_id, p_user_id) THEN
    RETURN NULL;
  END IF;

  v_restriction := public.is_user_restricted_from_community(p_community_id, p_user_id);
  IF v_restriction IS NOT NULL THEN
    RETURN v_restriction;
  END IF;

  IF v_c.access_status = 'archived' THEN
    RETURN 'Community archiviert — keine Beitritte möglich';
  END IF;

  IF v_c.access_status = 'closed' THEN
    RETURN 'Community aktuell geschlossen';
  END IF;

  IF v_c.admissions_paused OR v_c.access_status = 'paused' THEN
    RETURN 'Weitere Bewerbungen aktuell pausiert';
  END IF;

  IF public.is_community_at_member_limit(p_community_id) THEN
    IF v_c.waitlist_enabled AND NOT v_c.auto_reject_at_limit THEN
      RETURN NULL;
    END IF;
    RETURN 'Mitgliederlimit erreicht';
  END IF;

  IF v_c.visibility = 'premium'
     AND (v_c.monetization_enabled OR v_c.paid_join_required) THEN
    RETURN 'Kostenpflichtiger Zugang — Abo erforderlich';
  END IF;

  IF v_c.visibility = 'private' OR v_c.access_status = 'invite_only' THEN
    IF v_c.join_approval_mode = 'auto_reject' THEN
      RETURN 'Nur auf Einladung — Beitritt nicht möglich';
    END IF;
    RETURN NULL;
  END IF;

  IF v_c.join_approval_mode = 'auto_reject' THEN
    RETURN 'Beitritt derzeit nicht möglich';
  END IF;

  RETURN NULL;
END;
$$;

-- Warteliste: bei freiem Platz automatisch promoten
CREATE OR REPLACE FUNCTION public.handle_member_leave_waitlist_promote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waitlist_enabled BOOLEAN;
BEGIN
  IF TG_OP <> 'DELETE' THEN
    RETURN OLD;
  END IF;

  SELECT waitlist_enabled INTO v_waitlist_enabled
  FROM public.communities
  WHERE id = OLD.community_id;

  IF v_waitlist_enabled AND NOT public.is_community_at_member_limit(OLD.community_id) THEN
    BEGIN
      PERFORM public.promote_next_waitlisted_application(
        OLD.community_id,
        (SELECT creator_id FROM public.communities WHERE id = OLD.community_id)
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  IF OLD.role <> 'creator' THEN
    INSERT INTO public.community_member_restrictions (
      community_id,
      user_id,
      restriction_type,
      reason,
      restricted_until,
      created_by
    )
    SELECT
      OLD.community_id,
      OLD.user_id,
      'cooldown',
      'Rejoin-Schutz nach Verlassen',
      NOW() + (c.rejoin_cooldown_days || ' days')::INTERVAL,
      NULL
    FROM public.communities c
    WHERE c.id = OLD.community_id
      AND c.rejoin_cooldown_days IS NOT NULL
      AND c.rejoin_cooldown_days > 0
      AND NOT EXISTS (
        SELECT 1 FROM public.community_member_restrictions r
        WHERE r.community_id = OLD.community_id
          AND r.user_id = OLD.user_id
          AND r.lifted_at IS NULL
          AND r.restriction_type = 'ban'
      );
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS community_members_leave_lifecycle ON public.community_members;
CREATE TRIGGER community_members_leave_lifecycle
  AFTER DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_member_leave_waitlist_promote();

-- Archivierte Communities aus Discover ausblenden
CREATE OR REPLACE FUNCTION public.sync_community_archived_discover()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.access_status = 'archived' AND OLD.access_status IS DISTINCT FROM 'archived' THEN
    NEW.discover_enabled := FALSE;
    NEW.archived_at := COALESCE(NEW.archived_at, NOW());
  ELSIF NEW.access_status <> 'archived' AND OLD.access_status = 'archived' THEN
    NEW.archived_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS communities_archived_discover ON public.communities;
CREATE TRIGGER communities_archived_discover
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_archived_discover();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_member_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_restrictions_select"
  ON public.community_member_restrictions FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_moderate_community(community_id)
  );

CREATE POLICY "member_restrictions_manage"
  ON public.community_member_restrictions FOR ALL
  USING (public.can_moderate_community(community_id))
  WITH CHECK (public.can_moderate_community(community_id));

CREATE POLICY "join_application_files_select"
  ON public.community_join_application_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_application_files_insert_own"
  ON public.community_join_application_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Storage bucket Vorbereitung (Supabase Dashboard / CLI):
-- bucket: community-join-proofs, private, RLS per community



-- ========== 009_join_approval_modes.sql ==========
-- UNZE Join-Approval-Modi erweitern (Einladung, kostenpflichtige Freischaltung)
-- Nach 008_community_lifecycle.sql ausführen

ALTER TYPE public.join_approval_mode ADD VALUE IF NOT EXISTS 'invite_required';
ALTER TYPE public.join_approval_mode ADD VALUE IF NOT EXISTS 'paid_unlock';



-- ========== 010_platform_governance.sql ==========
-- UNZE Platform Governance Layer — Foundation Systems
-- Permission Engine, Reports, Audit, Trust, Soft Delete, Notification Center prep
-- Nach 009_join_approval_modes.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.report_target_type AS ENUM (
  'user',
  'community',
  'creator',
  'post',
  'comment'
);

CREATE TYPE public.report_status AS ENUM (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

CREATE TYPE public.moderation_action_type AS ENUM (
  'warn',
  'mute',
  'strike',
  'ban',
  'unban',
  'lift_restriction',
  'dismiss_report',
  'restore_member'
);

CREATE TYPE public.audit_category AS ENUM (
  'role_change',
  'application',
  'invite',
  'restriction',
  'settings',
  'membership',
  'moderation',
  'community_lifecycle',
  'permission'
);

CREATE TYPE public.trust_event_type AS ENUM (
  'verified_member_granted',
  'verified_member_revoked',
  'strike_received',
  'ban_received',
  'report_filed',
  'report_resolved',
  'community_joined',
  'community_left',
  'reputation_adjustment',
  'spam_flag',
  'scam_flag'
);

CREATE TYPE public.trust_flag_type AS ENUM (
  'spam_suspect',
  'scam_suspect',
  'report_spike',
  'verified',
  'restricted'
);

ALTER TYPE public.community_restriction_type ADD VALUE IF NOT EXISTS 'mute';
ALTER TYPE public.community_restriction_type ADD VALUE IF NOT EXISTS 'strike';

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'application';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'moderation';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'community_event';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'invite';

-- =============================================================================
-- Permission Engine — granulare Rechte mit Community-Overrides
-- =============================================================================
CREATE TABLE public.community_permission_definitions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  default_min_role public.community_role NOT NULL DEFAULT 'member',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.community_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.community_permission_definitions(key) ON DELETE CASCADE,
  role public.community_role NOT NULL,
  granted BOOLEAN NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, permission_key, role)
);

CREATE INDEX idx_permission_overrides_community
  ON public.community_permission_overrides(community_id);

-- Seed: granulare Permission-Definitionen
INSERT INTO public.community_permission_definitions (key, label, description, default_min_role, category) VALUES
  ('view', 'Ansehen', 'Community-Inhalte ansehen', 'member', 'content'),
  ('post', 'Beiträge erstellen', 'Posts in der Community erstellen', 'member', 'content'),
  ('comment', 'Kommentieren', 'Kommentare schreiben', 'member', 'content'),
  ('moderate', 'Moderieren', 'Inhalte moderieren', 'moderator', 'moderation'),
  ('review_applications', 'Anträge prüfen', 'Beitrittsanträge prüfen', 'moderator', 'access'),
  ('manage_invites', 'Einladungen verwalten', 'Einladungslinks erstellen', 'moderator', 'access'),
  ('ban_members', 'Mitglieder sperren', 'Bann/Mute/Strikes aussprechen', 'moderator', 'moderation'),
  ('view_restrictions', 'Sperren einsehen', 'Moderationshistorie & Sperren', 'moderator', 'moderation'),
  ('manage_reports', 'Meldungen bearbeiten', 'Nutzer-/Community-Meldungen prüfen', 'moderator', 'moderation'),
  ('view_audit_log', 'Audit-Log einsehen', 'Governance-Aktionen nachvollziehen', 'admin', 'governance'),
  ('manage_members', 'Mitglieder verwalten', 'Mitglieder entfernen/wiederherstellen', 'admin', 'members'),
  ('manage_roles', 'Rollen verwalten', 'Mitgliederrollen zuweisen', 'admin', 'members'),
  ('manage_settings', 'Einstellungen', 'Community-Einstellungen ändern', 'admin', 'settings'),
  ('manage_access', 'Zugang verwalten', 'Join-Logik & Status', 'admin', 'access'),
  ('manage_join_questions', 'Bewerbungsfragen', 'Fragen für Beitrittsanträge', 'admin', 'access'),
  ('manage_permissions', 'Rechte konfigurieren', 'Rollen-Rechte pro Community', 'admin', 'governance'),
  ('manage_monetization', 'Monetarisierung', 'Stripe & Abos (vorbereitet)', 'creator', 'monetization'),
  ('archive_community', 'Archivieren/Pausieren', 'Community-Lifecycle steuern', 'creator', 'lifecycle'),
  ('delete_community', 'Community löschen', 'Soft-Delete (Creator only)', 'creator', 'lifecycle'),
  ('transfer_ownership', 'Ownership übertragen', 'Creator-Rolle übergeben', 'creator', 'lifecycle')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- Reports & Moderation
-- =============================================================================
CREATE TABLE public.platform_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.report_target_type NOT NULL,
  target_id UUID NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_reports_community
  ON public.platform_reports(community_id, status, created_at DESC);

CREATE INDEX idx_platform_reports_target
  ON public.platform_reports(target_type, target_id);

CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type public.moderation_action_type NOT NULL,
  report_id UUID REFERENCES public.platform_reports(id) ON DELETE SET NULL,
  restriction_id UUID REFERENCES public.community_member_restrictions(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_community
  ON public.moderation_actions(community_id, created_at DESC);

CREATE TABLE public.community_member_strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strike_number INTEGER NOT NULL CHECK (strike_number > 0),
  reason TEXT,
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderation_action_id UUID REFERENCES public.moderation_actions(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_strikes_user
  ON public.community_member_strikes(community_id, user_id, active);

-- =============================================================================
-- Audit Logs
-- =============================================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  category public.audit_category NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_community
  ON public.audit_logs(community_id, created_at DESC);

CREATE INDEX idx_audit_logs_category
  ON public.audit_logs(category, created_at DESC);

-- =============================================================================
-- Notification Center — Präferenzen
-- =============================================================================
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  applications BOOLEAN NOT NULL DEFAULT TRUE,
  moderation BOOLEAN NOT NULL DEFAULT TRUE,
  invites BOOLEAN NOT NULL DEFAULT TRUE,
  community_events BOOLEAN NOT NULL DEFAULT TRUE,
  system BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Trust / Reputation Layer
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS trust_score INTEGER NOT NULL DEFAULT 100;

ALTER TABLE public.communities
  ADD CONSTRAINT communities_trust_score_range
    CHECK (trust_score >= 0 AND trust_score <= 1000);

CREATE TABLE public.trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  event_type public.trust_event_type NOT NULL,
  delta INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_events_user ON public.trust_events(user_id, created_at DESC);
CREATE INDEX idx_trust_events_community ON public.trust_events(community_id, created_at DESC);

CREATE TABLE public.user_trust_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flag_type public.trust_flag_type NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  reason TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_trust_flags_active
  ON public.user_trust_flags(user_id, active)
  WHERE active = TRUE;

-- =============================================================================
-- Soft Delete / Archivierung
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS restored_at TIMESTAMPTZ;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_communities_not_deleted
  ON public.communities(id) WHERE deleted_at IS NULL;

CREATE INDEX idx_community_members_active
  ON public.community_members(community_id, user_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- Hilfsfunktionen
-- =============================================================================
CREATE OR REPLACE FUNCTION public.soft_remove_community_member(
  p_member_id UUID,
  p_actor_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_members
  SET deleted_at = NOW(),
      deleted_by = p_actor_id,
      restored_at = NULL
  WHERE id = p_member_id
    AND deleted_at IS NULL
    AND role <> 'creator';
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_community_member(
  p_member_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_members
  SET deleted_at = NULL,
      deleted_by = NULL,
      restored_at = NOW()
  WHERE id = p_member_id
    AND deleted_at IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.count_active_member_strikes(
  p_community_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.community_member_strikes
  WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_member_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permission_definitions_select"
  ON public.community_permission_definitions FOR SELECT
  USING (TRUE);

CREATE POLICY "permission_overrides_select"
  ON public.community_permission_overrides FOR SELECT
  USING (
    public.can_manage_community(community_id, auth.uid())
    OR public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "permission_overrides_manage"
  ON public.community_permission_overrides FOR ALL
  USING (public.can_manage_community(community_id, auth.uid()))
  WITH CHECK (public.can_manage_community(community_id, auth.uid()));

CREATE POLICY "reports_insert_own"
  ON public.platform_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_reporter"
  ON public.platform_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "reports_select_moderator"
  ON public.platform_reports FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "reports_update_moderator"
  ON public.platform_reports FOR UPDATE
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "moderation_actions_select"
  ON public.moderation_actions FOR SELECT
  USING (public.can_moderate_community(community_id, auth.uid()));

CREATE POLICY "moderation_actions_insert"
  ON public.moderation_actions FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "member_strikes_select"
  ON public.community_member_strikes FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "member_strikes_insert"
  ON public.community_member_strikes FOR INSERT
  WITH CHECK (public.can_moderate_community(community_id, auth.uid()));

CREATE POLICY "audit_logs_select"
  ON public.audit_logs FOR SELECT
  USING (
    community_id IS NULL
    OR public.can_manage_community(community_id, auth.uid())
  );

CREATE POLICY "audit_logs_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id
    AND (
      community_id IS NULL
      OR public.can_moderate_community(community_id, auth.uid())
    )
  );

CREATE POLICY "notification_preferences_own"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trust_events_select_own"
  ON public.trust_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_events_select_moderator"
  ON public.trust_events FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "trust_flags_select_own"
  ON public.user_trust_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_flags_select_moderator"
  ON public.user_trust_flags FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );


