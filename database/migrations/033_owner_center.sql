-- Owner Center — Plattform-Rolle owner, Sperr-Flags, Rollenschutz
-- Nach 032_report_group_event_targets.sql

DO $$ BEGIN
  ALTER TYPE public.platform_role ADD VALUE 'owner';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS platform_suspended BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS platform_suspended BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND platform_role IN ('owner', 'platform_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_owner(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_platform_admin(p_user_id);
$$;

CREATE OR REPLACE FUNCTION public.prevent_platform_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.platform_role IS DISTINCT FROM OLD.platform_role
     AND NEW.platform_role IN ('owner', 'platform_admin')
     AND OLD.platform_role NOT IN ('owner', 'platform_admin')
     AND auth.uid() = NEW.id
  THEN
    NEW.platform_role := OLD.platform_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_platform_role_guard ON public.profiles;
CREATE TRIGGER profiles_platform_role_guard
  BEFORE UPDATE OF platform_role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_platform_role_self_escalation();

DROP POLICY IF EXISTS "reports_select_platform_owner" ON public.platform_reports;
CREATE POLICY "reports_select_platform_owner"
  ON public.platform_reports
  FOR SELECT
  TO authenticated
  USING (public.is_platform_owner(auth.uid()));

DROP POLICY IF EXISTS "reports_update_platform_owner" ON public.platform_reports;
CREATE POLICY "reports_update_platform_owner"
  ON public.platform_reports
  FOR UPDATE
  TO authenticated
  USING (public.is_platform_owner(auth.uid()))
  WITH CHECK (public.is_platform_owner(auth.uid()));
