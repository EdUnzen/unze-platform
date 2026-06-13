-- Schritt 1: Enum-Wert (eigene Transaktion — siehe apply-migration-033.mjs)
DO $$ BEGIN
  ALTER TYPE public.platform_role ADD VALUE 'owner';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
