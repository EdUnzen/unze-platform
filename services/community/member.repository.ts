import { createClient } from "@/lib/supabase/server";
import type { CommunityMemberView } from "@/types/dashboard";
import type { CommunityRole } from "@/types/database";

export async function fetchMembership(
  communityId: string,
  userId: string,
): Promise<{ role: CommunityRole } | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return null;
  return { role: data.role as CommunityRole };
}

export async function fetchMembersWithProfiles(
  communityId: string,
): Promise<CommunityMemberView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_members")
    .select(
      `
      id,
      user_id,
      role,
      joined_at,
      profile:profiles (
        id,
        display_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .eq("community_id", communityId)
    .is("deleted_at", null)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("[member.repository] fetchMembers:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const rawProfile = row.profile as
      | {
          display_name: string | null;
          username: string | null;
          avatar_url: string | null;
          is_verified: boolean;
        }
      | {
          display_name: string | null;
          username: string | null;
          avatar_url: string | null;
          is_verified: boolean;
        }[]
      | null;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

    return {
      id: row.id as string,
      userId: row.user_id as string,
      role: row.role as CommunityRole,
      joinedAt: row.joined_at as string,
      displayName: profile?.display_name ?? null,
      username: profile?.username ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      isVerified: profile?.is_verified ?? false,
    };
  });
}

export async function updateMemberRoleInDb(
  memberId: string,
  role: CommunityRole,
): Promise<{ error: string | null }> {
  if (role === "creator") {
    return { error: "Creator-Rolle kann nicht zugewiesen werden" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_members")
    .update({ role })
    .eq("id", memberId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function removeMemberInDb(
  memberId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("id", memberId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function joinCommunityInDb(
  communityId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("community_members").insert({
    community_id: communityId,
    user_id: userId,
    role: "member",
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function leaveCommunityInDb(
  communityId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .neq("role", "creator");

  if (error) return { error: error.message };
  return { error: null };
}
