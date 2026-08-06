import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type StudioRole = "super_admin" | "administrator" | "projektmanager" | "entwickler" | "designer" | "buchhaltung";

export type StudioUser = {
  id: string;
  authUserId: string;
  email: string;
  displayName: string | null;
  roleId: StudioRole;
};

export async function getStudioUserByAuthId(authUserId: string): Promise<StudioUser | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .schema("studio_auth")
    .from("users")
    .select("id, auth_user_id, email, display_name, role_id")
    .eq("auth_user_id", authUserId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    email: data.email,
    displayName: data.display_name,
    roleId: data.role_id as StudioRole,
  };
}

/** Erster Studio-Nutzer wird automatisch Super Admin */
export async function ensureStudioUser(
  authUserId: string,
  email: string,
  displayName?: string | null,
): Promise<StudioUser | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const existing = await getStudioUserByAuthId(authUserId);
  if (existing) return existing;

  const { count } = await admin
    .schema("studio_auth")
    .from("users")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return null;
  }

  const roleId: StudioRole = "super_admin";

  const { data, error } = await admin
    .schema("studio_auth")
    .from("users")
    .insert({
      auth_user_id: authUserId,
      email,
      display_name: displayName ?? null,
      role_id: roleId,
    })
    .select("id, auth_user_id, email, display_name, role_id")
    .single();

  if (error || !data) {
    console.error("[studio/auth] ensureStudioUser", error);
    return null;
  }

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    email: data.email,
    displayName: data.display_name,
    roleId: data.role_id as StudioRole,
  };
}

export async function getStudioSession(): Promise<StudioUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return getStudioUserByAuthId(user.id);
}
