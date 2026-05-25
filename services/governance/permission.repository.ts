import { createClient } from "@/lib/supabase/server";
import type { PermissionOverride } from "@/types/governance";
import type { CommunityRole } from "@/types/database";

export async function fetchPermissionOverridesFromDb(
  communityId: string,
): Promise<PermissionOverride[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_permission_overrides")
    .select("id, community_id, permission_key, role, granted, updated_at")
    .eq("community_id", communityId);

  if (error) {
    console.error("[permission.repository]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    communityId: row.community_id as string,
    permissionKey: row.permission_key as PermissionOverride["permissionKey"],
    role: row.role as CommunityRole,
    granted: row.granted as boolean,
    updatedAt: row.updated_at as string,
  }));
}

export async function upsertPermissionOverrideInDb(input: {
  communityId: string;
  permissionKey: string;
  role: CommunityRole;
  granted: boolean;
  updatedBy: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("community_permission_overrides").upsert(
    {
      community_id: input.communityId,
      permission_key: input.permissionKey,
      role: input.role,
      granted: input.granted,
      updated_by: input.updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "community_id,permission_key,role" },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function deletePermissionOverrideInDb(
  overrideId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_permission_overrides")
    .delete()
    .eq("id", overrideId);

  if (error) return { error: error.message };
  return { error: null };
}
