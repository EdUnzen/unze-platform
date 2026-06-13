-- Schritt 2: Spalten, Funktion, Trigger (nach 033a)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS platform_suspended BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id
      AND platform_role IN ('owner', 'platform_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.protect_platform_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.platform_role IS DISTINCT FROM OLD.platform_role
     AND NEW.platform_role IN ('owner', 'platform_admin')
     AND OLD.platform_role NOT IN ('owner', 'platform_admin')
     AND auth.uid() IS NOT NULL
     AND auth.uid() = NEW.id THEN
    NEW.platform_role := OLD.platform_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_platform_role ON public.profiles;
CREATE TRIGGER profiles_protect_platform_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_platform_role_escalation();
