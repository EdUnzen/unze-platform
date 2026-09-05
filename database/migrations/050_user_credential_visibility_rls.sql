-- Öffentliche Auszeichnungen im Profil + Sichtbarkeit durch Nutzer steuerbar

CREATE POLICY "user_credentials_select_public"
  ON public.user_credentials FOR SELECT
  USING (
    visibility = 'public'
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "user_credentials_update_own"
  ON public.user_credentials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT UPDATE ON public.user_credentials TO authenticated;
