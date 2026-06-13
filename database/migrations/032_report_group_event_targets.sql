-- Erweitert Meldeziele für Gruppen/Services und Events (Pilotphase)
DO $$ BEGIN
  ALTER TYPE public.report_target_type ADD VALUE 'group';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.report_target_type ADD VALUE 'event';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
