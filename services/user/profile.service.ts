import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";
import type { User } from "@supabase/supabase-js";

function buildProfileRow(user: User) {
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "UNZE Mitglied";

  return {
    id: user.id,
    display_name: displayName,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
  };
}

/** Profil-Zeile per User-ID (Community-Create, auch ohne Session-User-Objekt). */
export async function ensureProfileExists(userId: string): Promise<{ error: Error | null }> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  if (admin) {
    const { data: authData, error: authErr } = await admin.auth.admin.getUserById(userId);
    if (!authErr && authData?.user) {
      return ensureUserProfile(authData.user);
    }
    const { error } = await admin.from("profiles").upsert(
      { id: userId, display_name: "UNZE Mitglied" },
      { onConflict: "id" },
    );
    return { error: error ? new Error(error.message) : null };
  }

  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return { error: null };

  const { error: insertErr } = await supabase.from("profiles").insert({
    id: userId,
    display_name: "UNZE Mitglied",
  });
  return { error: insertErr ?? null };
}

/** Stellt sicher, dass profiles-Zeile existiert (behebt creator_id FK bei Community-Create). */
export async function ensureUserProfile(user: User): Promise<{ error: Error | null }> {
  const row = buildProfileRow(user);

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.from("profiles").upsert(row, { onConflict: "id" });
    return { error: error ? new Error(error.message) : null };
  }

  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return { error: null };

  const { error: insertErr } = await supabase.from("profiles").insert(row);
  return { error: insertErr ?? null };
}

export async function updateProfile(
  userId: string,
  updates: Partial<
    Pick<ProfileRow, "username" | "display_name" | "bio" | "avatar_url" | "settings">
  >,
) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  return supabase.from("profiles").update(updates).eq("id", userId).select().single();
}

export async function enableCreatorProfile(userId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: new Error("Supabase nicht konfiguriert") };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_creator: true, platform_role: "creator" as const })
    .eq("id", userId);

  if (profileError) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    if (admin) {
      const { error: adminProfileErr } = await admin
        .from("profiles")
        .update({ is_creator: true, platform_role: "creator" as const })
        .eq("id", userId);
      if (adminProfileErr) return { error: adminProfileErr };
    } else {
      return { error: profileError };
    }
  }

  const { error: creatorError } = await supabase.from("creator_profiles").upsert({
    user_id: userId,
    headline: null,
    platform_links: [],
  });

  if (creatorError) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    if (admin) {
      const { error: adminCreatorErr } = await admin.from("creator_profiles").upsert({
        user_id: userId,
        headline: null,
        platform_links: [],
      });
      return { error: adminCreatorErr };
    }
  }

  return { error: creatorError };
}
