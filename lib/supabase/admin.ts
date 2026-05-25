import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Service-Role Client — nur serverseitig für Admin-Operationen.
 * Optional: wenn nicht konfiguriert, Fallback auf Session-Client.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) return null;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
