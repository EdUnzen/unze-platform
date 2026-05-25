-- UNZE Platform Event Architecture — Global Event Store & Activity Log
-- Nach 012_verification_system.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.platform_event_domain AS ENUM (
  'community',
  'membership',
  'verification',
  'moderation',
  'trust',
  'billing',
  'badge',
  'governance',
  'invite',
  'notification'
);

-- =============================================================================
-- Immutable Event Store (Event Sourcing light — Realtime/Analytics vorbereitet)
-- =============================================================================
CREATE TABLE public.platform_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  domain public.platform_event_domain NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject_type TEXT,
  subject_id UUID,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id UUID,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_events_type ON public.platform_events(event_type, created_at DESC);
CREATE INDEX idx_platform_events_community ON public.platform_events(community_id, created_at DESC)
  WHERE community_id IS NOT NULL;
CREATE INDEX idx_platform_events_actor ON public.platform_events(actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;
CREATE INDEX idx_platform_events_target ON public.platform_events(target_user_id, created_at DESC)
  WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_platform_events_correlation ON public.platform_events(correlation_id)
  WHERE correlation_id IS NOT NULL;

-- Realtime-Vorbereitung: Supabase Realtime auf platform_events aktivieren (Dashboard)

-- =============================================================================
-- Event-Handler Audit Trail (welche Handler liefen)
-- =============================================================================
CREATE TABLE public.platform_event_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.platform_events(id) ON DELETE CASCADE,
  handler_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_deliveries_event ON public.platform_event_deliveries(event_id);

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_event_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_events_insert_authenticated"
  ON public.platform_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "platform_events_select_actor"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (
    actor_id = auth.uid()
    OR target_user_id = auth.uid()
  );

CREATE POLICY "platform_events_select_community_mod"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "platform_events_select_platform_admin"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "event_deliveries_select_platform_admin"
  ON public.platform_event_deliveries FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "event_deliveries_insert_service"
  ON public.platform_event_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);
