import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymer Supabase-Client ohne cookies() — für unstable_cache / Schema-Probes.
 * Nicht für nutzergebundene Auth-Queries verwenden.
 */
export function createPublicSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  return createSupabaseClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
