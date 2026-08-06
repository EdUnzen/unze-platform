-- Fix: auth signup fails when handle_new_user runs with search_path=public only.
-- gen_random_bytes lives in extensions schema on Supabase.

CREATE OR REPLACE FUNCTION public.generate_unze_public_id()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public, extensions
AS $$
  SELECT 'UZ' || encode(extensions.gen_random_bytes(16), 'hex');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, unze_public_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    public.generate_unze_public_id()
  );
  RETURN NEW;
END;
$$;
