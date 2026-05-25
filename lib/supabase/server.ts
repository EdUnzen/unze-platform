import {
  getSupabaseAnonKey,
  getSupabaseEnvHint,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    const hint = getSupabaseEnvHint();
    if (hint) {
      console.error("[supabase/server]", hint);
    }
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component — Cookies werden in Middleware gesetzt
        }
      },
    },
  });
}
