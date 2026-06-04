import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

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
