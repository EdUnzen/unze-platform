-- Plattform-Typen erweitern (rückwärtskompatibel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'instagram'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'instagram';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'tiktok'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'tiktok';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'youtube'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'youtube';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'website'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'website';
  END IF;
END $$;
