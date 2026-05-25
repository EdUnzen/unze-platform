import { createClient } from "@/lib/supabase/server";
import type {
  CommunityInviteLink,
  CreateInviteLinkInput,
  InviteLinkPreview,
} from "@/types/access";
import type { CommunityRole } from "@/types/database";
import { randomBytes } from "crypto";

function generateInviteCode(): string {
  return randomBytes(9).toString("base64url");
}

function mapInviteRow(row: {
  id: string;
  community_id: string;
  code: string;
  label: string | null;
  created_by: string;
  assigned_role: CommunityRole;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  is_single_use: boolean;
  is_active: boolean;
  bypass_closed: boolean;
  created_at: string;
  updated_at: string;
}): CommunityInviteLink {
  const isExpired =
    row.expires_at !== null && new Date(row.expires_at) < new Date();
  const isExhausted =
    (row.is_single_use && row.use_count >= 1) ||
    (row.max_uses !== null && row.use_count >= row.max_uses);

  return {
    id: row.id,
    communityId: row.community_id,
    code: row.code,
    label: row.label,
    createdBy: row.created_by,
    assignedRole: row.assigned_role,
    expiresAt: row.expires_at,
    maxUses: row.max_uses,
    useCount: row.use_count,
    isSingleUse: row.is_single_use,
    isActive: row.is_active,
    bypassClosed: row.bypass_closed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isExpired,
    isExhausted,
  };
}

export async function fetchInviteLinksFromDb(
  communityId: string,
): Promise<CommunityInviteLink[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_invite_links")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[invite.repository] fetchLinks:", error.message);
    return [];
  }

  return (data ?? []).map(mapInviteRow);
}

export async function createInviteLinkInDb(
  communityId: string,
  createdBy: string,
  input: CreateInviteLinkInput,
): Promise<CommunityInviteLink | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const role = input.assignedRole ?? "member";
  if (role === "creator") return null;

  let code = generateInviteCode();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("community_invite_links")
      .insert({
        community_id: communityId,
        code,
        label: input.label ?? null,
        created_by: createdBy,
        assigned_role: role,
        expires_at: input.expiresAt ?? null,
        max_uses: input.maxUses ?? null,
        is_single_use: input.isSingleUse ?? false,
        bypass_closed: input.bypassClosed ?? true,
      })
      .select("*")
      .single();

    if (!error && data) return mapInviteRow(data);
    if (error?.code !== "23505") {
      console.error("[invite.repository] createLink:", error?.message);
      return null;
    }
    code = generateInviteCode();
  }

  return null;
}

export async function deactivateInviteLinkInDb(
  inviteId: string,
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("community_invite_links")
    .update({ is_active: false })
    .eq("id", inviteId);

  return !error;
}

export async function fetchInvitePreviewFromDb(
  code: string,
): Promise<InviteLinkPreview | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: invite, error } = await supabase
    .from("community_invite_links")
    .select(
      `
      code,
      community_id,
      assigned_role,
      expires_at,
      is_active,
      is_single_use,
      max_uses,
      use_count,
      community:communities (
        title,
        slug,
        access_status,
        admissions_paused
      )
    `,
    )
    .eq("code", code)
    .maybeSingle();

  if (error || !invite) return null;

  const community = invite.community as
    | {
        title: string;
        slug: string;
        access_status: string;
        admissions_paused: boolean;
      }
    | {
        title: string;
        slug: string;
        access_status: string;
        admissions_paused: boolean;
      }[]
    | null;

  const c = Array.isArray(community) ? community[0] : community;
  if (!c) return null;

  let invalidReason: string | null = null;
  if (!invite.is_active) invalidReason = "Einladungslink deaktiviert";
  else if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    invalidReason = "Einladungslink abgelaufen";
  } else if (invite.is_single_use && invite.use_count >= 1) {
    invalidReason = "Einladungslink bereits verwendet";
  } else if (
    invite.max_uses !== null &&
    invite.use_count >= invite.max_uses
  ) {
    invalidReason = "Einladungslink ausgeschöpft";
  }

  return {
    code: invite.code as string,
    communityId: invite.community_id as string,
    communityTitle: c.title,
    communitySlug: c.slug,
    assignedRole: invite.assigned_role as CommunityRole,
    expiresAt: invite.expires_at as string | null,
    isValid: invalidReason === null,
    invalidReason,
  };
}

export async function redeemInviteViaRpc(
  code: string,
  userId: string,
): Promise<{
  error: string | null;
  result?: {
    status: string;
    communityId: string;
    slug: string;
    role?: string;
  };
}> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.rpc("redeem_community_invite", {
    p_code: code,
    p_user_id: userId,
  });

  if (error) return { error: error.message };

  const result = data as {
    status: string;
    community_id: string;
    slug: string;
    role?: string;
  };

  return {
    error: null,
    result: {
      status: result.status,
      communityId: result.community_id,
      slug: result.slug,
      role: result.role,
    },
  };
}

export async function promoteWaitlistedViaRpc(
  communityId: string,
  reviewerId: string,
): Promise<{
  error: string | null;
  application?: { id: string; userId: string };
}> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.rpc("promote_next_waitlisted_application", {
    p_community_id: communityId,
    p_reviewer_id: reviewerId,
  });

  if (error) return { error: error.message };
  if (!data) return { error: null };

  const row = data as { id: string; user_id: string };
  return {
    error: null,
    application: { id: row.id, userId: row.user_id },
  };
}

export async function fetchInviteLinkByCodeFromDb(
  code: string,
): Promise<CommunityInviteLink | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_invite_links")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapInviteRow(data);
}
