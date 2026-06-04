import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export async function getSession() {
  const supabase = await createClient();
  if (!supabase) return { user: null, session: null };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { user: session?.user ?? null, session };
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
});

export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
});

export async function signOut() {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };
  return supabase.auth.signOut();
}
