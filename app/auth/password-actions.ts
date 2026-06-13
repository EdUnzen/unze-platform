"use server";

import { authNotConfiguredMessage, mapAuthError } from "@/lib/auth/user-facing-errors";
import { safeRedirectPath } from "@/lib/auth/routes";
import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestPasswordResetAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: authNotConfiguredMessage() };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "E-Mail-Adresse erforderlich" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Verbindung fehlgeschlagen — bitte erneut versuchen." };

  const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return {
    success:
      "Falls ein Konto mit dieser E-Mail existiert, erhältst du in Kürze einen Link zum Zurücksetzen.",
  };
}

export async function updatePasswordAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: authNotConfiguredMessage() };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const returnTo = safeRedirectPath(String(formData.get("next") ?? "/auth/login"));

  if (!password || password.length < 8) {
    return { error: "Passwort mindestens 8 Zeichen" };
  }

  if (password !== confirm) {
    return { error: "Passwörter stimmen nicht überein" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Verbindung fehlgeschlagen — bitte erneut versuchen." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Link abgelaufen oder ungültig. Bitte fordere einen neuen Reset-Link an.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(`${returnTo}?message=${encodeURIComponent("Passwort erfolgreich geändert — du kannst dich jetzt anmelden.")}`);
}
