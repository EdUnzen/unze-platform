-- Geplante Umstellung auf Premium (ohne Auto-Abbuchung)

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS premium_transition_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_transition_notify_members BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.communities.premium_transition_scheduled_at IS
  'Ab diesem Datum wird die Community kostenpflichtig (Mitglieder werden vorher informiert).';
