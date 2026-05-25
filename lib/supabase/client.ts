import { getSupabaseAnonKey, getSupabaseEnvHint, getSupabaseUrl, isSupabaseConfigured } from "@/lib/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (!isSupabaseConfigured()) {
    const hint = getSupabaseEnvHint();
    throw new Error(hint ?? "Supabase ist nicht konfiguriert. Siehe .env.example");
  }

  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
