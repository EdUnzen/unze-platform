-- RC1: check_in_event_ticket returns ticket id + post-check-in rewards for scanner UI

DROP FUNCTION IF EXISTS public.check_in_event_ticket(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.check_in_event_ticket(
  p_ticket_code TEXT,
  p_actor_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.event_tickets%ROWTYPE;
  v_rewards JSONB;
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

  v_rewards := public.apply_event_check_in_rewards(
    v_ticket.event_id,
    v_ticket.user_id,
    p_actor_id,
    v_ticket.id
  );

  RETURN jsonb_build_object(
    'ticketId', v_ticket.id,
    'rewards', v_rewards
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_in_event_ticket(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_in_event_ticket(TEXT, UUID) TO service_role;
