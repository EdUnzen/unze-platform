"use server";

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
    return {
      error: process.env.VERCEL
        ? "Supabase ist nicht konfiguriert. Prüfe Vercel Environment Variables."
        : "Supabase ist nicht konfiguriert. Siehe .env.example",
    };
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
  if (!supabase) return { error: "Verbindung fehlgeschlagen" };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(returnTo);
}

export async function signUpWithEmail(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      error: process.env.VERCEL
        ? "Supabase ist nicht konfiguriert. Prüfe Vercel Environment Variables."
        : "Supabase ist nicht konfiguriert. Siehe .env.example",
    };
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
  if (!supabase) return { error: "Verbindung fehlgeschlagen" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(returnTo)}`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) return { error: error.message };

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
    success: `Bestätige deine E-Mail — der Link führt zurück zu ${getAppUrl()}. Danach kannst du dich anmelden.`,
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
