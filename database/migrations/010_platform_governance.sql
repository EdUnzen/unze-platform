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
