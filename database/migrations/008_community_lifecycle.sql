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
