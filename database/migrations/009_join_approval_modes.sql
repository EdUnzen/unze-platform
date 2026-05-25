-- UNZE Join-Approval-Modi erweitern (Einladung, kostenpflichtige Freischaltung)
-- Nach 008_community_lifecycle.sql ausführen

ALTER TYPE public.join_approval_mode ADD VALUE IF NOT EXISTS 'invite_required';
ALTER TYPE public.join_approval_mode ADD VALUE IF NOT EXISTS 'paid_unlock';
