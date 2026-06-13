-- Event Ticket System v1 — Closed Beta

CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'used', 'cancelled')),
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_tickets_one_per_user UNIQUE (event_id, user_id),
  CONSTRAINT event_tickets_code_unique UNIQUE (ticket_code)
);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event
  ON public.event_tickets(event_id, status);

CREATE INDEX IF NOT EXISTS idx_event_tickets_user
  ON public.event_tickets(user_id, booked_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_tickets_code
  ON public.event_tickets(ticket_code);

DROP TRIGGER IF EXISTS event_tickets_updated_at ON public.event_tickets;
CREATE TRIGGER event_tickets_updated_at
  BEFORE UPDATE ON public.event_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_tickets_select_own" ON public.event_tickets;
CREATE POLICY "event_tickets_select_own"
  ON public.event_tickets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_tickets_select_manage" ON public.event_tickets;
CREATE POLICY "event_tickets_select_manage"
  ON public.event_tickets FOR SELECT
  USING (public.can_manage_community(community_id));

DROP POLICY IF EXISTS "event_tickets_insert_own" ON public.event_tickets;
CREATE POLICY "event_tickets_insert_own"
  ON public.event_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_tickets_update_manage" ON public.event_tickets;
CREATE POLICY "event_tickets_update_manage"
  ON public.event_tickets FOR UPDATE
  USING (public.can_manage_community(community_id));

GRANT SELECT, INSERT ON public.event_tickets TO authenticated;
GRANT UPDATE ON public.event_tickets TO authenticated;
GRANT ALL ON public.event_tickets TO service_role;

-- Atomischer Check-In — verhindert Mehrfachnutzung
CREATE OR REPLACE FUNCTION public.check_in_event_ticket(
  p_ticket_code TEXT,
  p_actor_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.event_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket
  FROM public.event_tickets
  WHERE ticket_code = p_ticket_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket nicht gefunden';
  END IF;

  IF NOT public.can_manage_community(v_ticket.community_id, p_actor_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  IF v_ticket.status = 'used' THEN
    RAISE EXCEPTION 'Ticket bereits verwendet';
  END IF;

  IF v_ticket.status = 'cancelled' THEN
    RAISE EXCEPTION 'Ticket storniert';
  END IF;

  UPDATE public.event_tickets
  SET status = 'used',
      checked_in_at = NOW(),
      checked_in_by = p_actor_id
  WHERE id = v_ticket.id;

  RETURN v_ticket.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_in_event_ticket(TEXT, UUID) TO authenticated;
