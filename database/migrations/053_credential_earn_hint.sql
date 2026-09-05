-- Optionaler Hinweis: Wie man die Auszeichnung erhält (Marketing / Community-Übersicht)

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS earn_hint TEXT;
