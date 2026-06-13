"use server";

import { authNotConfiguredMessage, mapAuthError } from "@/lib/auth/user-facing-errors";
import { safeRedirectPath } from "@/lib/auth/routes";
import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInWithEmail(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: authNotConfiguredMessage() };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeRedirectPath(
    String(formData.get("next") ?? formData.get("redirect") ?? ""),
  );

  if (!email || !password) {
    return { error: "E-Mail und Passwort erforderlich" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Verbindung fehlgeschlagen — bitte erneut versuchen." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapAuthError(error.message) };

  revalidatePath("/", "layout");
  redirect(returnTo);
}

export async function signUpWithEmail(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: authNotConfiguredMessage() };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const returnTo = safeRedirectPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "E-Mail und Passwort erforderlich" };
  }

  if (password.length < 8) {
    return { error: "Passwort mindestens 8 Zeichen" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Verbindung fehlgeschlagen — bitte erneut versuchen." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(returnTo)}`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) return { error: mapAuthError(error.message) };

  if (data.user && displayName) {
    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", data.user.id);
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(returnTo || "/");
  }

  return {
    success:
      "Fast geschafft — bestätige deine E-Mail über den Link in deinem Postfach. Danach kannst du dich anmelden.",
  };
}

export async function signInWithOAuthAction(
  provider: "google" | "apple",
  returnTo = "/",
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: authNotConfiguredMessage() };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Verbindung fehlgeschlagen — bitte erneut versuchen." };

  const safeReturn = safeRedirectPath(returnTo);
  const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent(safeReturn)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) return { error: mapAuthError(error.message) };
  if (data.url) redirect(data.url);
  return { error: "Anmeldung konnte nicht gestartet werden. Bitte erneut versuchen." };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
