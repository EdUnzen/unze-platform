import { isSupabaseConfigured } from "@/lib/env";

/** Demo-/Beta-Modus: simulierte Daten wenn Supabase fehlt oder explizit aktiviert */
export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") return false;
  return !isSupabaseConfigured();
}

export function isMockCommunityId(id: string): boolean {
  return id.startsWith("mock-");
}
