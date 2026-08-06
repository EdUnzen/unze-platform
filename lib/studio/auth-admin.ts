import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import { getStudioUserByAuthId } from "@/lib/studio/auth";

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const found = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (found) return found;

    if (data.users.length < 200) break;
    page++;
  }

  return null;
}

export function needsPasswordSetup(user: User): boolean {
  if (user.user_metadata?.password_setup_required === true) return true;
  return user.last_sign_in_at == null;
}

export async function hasStudioAccess(authUserId: string): Promise<boolean> {
  const studioUser = await getStudioUserByAuthId(authUserId);
  return studioUser != null;
}

export type StudioAuthMode = "setup" | "login" | "none";

export async function getStudioAuthModeForEmail(email: string): Promise<StudioAuthMode> {
  const trimmed = email.trim();
  if (!trimmed) return "none";

  try {
    const authUser = await findAuthUserByEmail(trimmed);
    if (!authUser || !(await hasStudioAccess(authUser.id))) return "none";
    return needsPasswordSetup(authUser) ? "setup" : "login";
  } catch {
    return "none";
  }
}

export async function markPasswordSetupComplete(authUserId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data, error } = await admin.auth.admin.getUserById(authUserId);
  if (error || !data.user) return false;

  const { error: updateError } = await admin.auth.admin.updateUserById(authUserId, {
    user_metadata: {
      ...data.user.user_metadata,
      password_setup_required: false,
    },
  });

  return !updateError;
}
