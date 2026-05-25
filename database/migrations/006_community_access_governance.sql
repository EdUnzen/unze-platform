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
