import { createClient } from "@/lib/supabase/server";
import type { CommunityBadgeView } from "@/types/dashboard";
import type { BadgeType } from "@/types/database";
import type { CredentialCategory } from "@/types/credential";

function badgeTypeToValidityMode(badgeType: BadgeType): string {
  if (badgeType === "temporary" || badgeType === "event") return "expires_at";
  return "permanent";
}
import {
  grantCredentialInDb,
  mapValidityToBadgeType,
} from "@/services/credentials/credential.repository";

async function fetchCredentialsByCommunity(
  communityId: string,
  options?: { activeOnly?: boolean },
): Promise<
  {
    id: string;
    community_id: string;
    name: string;
    description: string | null;
    validity_mode: string;
    icon_url: string | null;
    category: string | null;
    earn_hint: string | null;
  }[]
> {
  const supabase = await createClient();
  if (!supabase) return [];

  const query = supabase
    .from("credentials")
    .select("id, community_id, name, description, validity_mode, icon_url, category, archived_at, earn_hint")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  const { data, error } =
    options?.activeOnly === false
      ? await query
      : await query.is("archived_at", null);

  if (error) {
    console.error("[badge.repository] credentials:", error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchBadgesByCommunity(
  communityId: string,
  options?: { activeOnly?: boolean },
): Promise<CommunityBadgeView[]> {
  const credentials = await fetchCredentialsByCommunity(communityId, options);
  if (credentials.length === 0) {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("badges")
      .select("id, community_id, name, description, badge_type, icon_url")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[badge.repository] fetch legacy:", error.message);
      return [];
    }

    const badges = data ?? [];
    if (badges.length === 0) return [];

    const badgeIds = badges.map((b) => b.id as string);
    const { data: grants } = await supabase
      .from("user_badges")
      .select("badge_id")
      .in("badge_id", badgeIds);

    const grantCounts: Record<string, number> = {};
    for (const row of grants ?? []) {
      const id = row.badge_id as string;
      grantCounts[id] = (grantCounts[id] ?? 0) + 1;
    }

    return badges.map((badge) => ({
      id: badge.id,
      communityId: badge.community_id,
      name: badge.name,
      description: badge.description,
      badgeType: badge.badge_type as BadgeType,
      iconUrl: badge.icon_url,
      grantedCount: grantCounts[badge.id as string] ?? 0,
    }));
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const credentialIds = credentials.map((c) => c.id);
  const { data: grants } = await supabase
    .from("user_credentials")
    .select("credential_id")
    .in("credential_id", credentialIds)
    .is("revoked_at", null);

  const grantCounts: Record<string, number> = {};
  for (const row of grants ?? []) {
    const id = row.credential_id as string;
    grantCounts[id] = (grantCounts[id] ?? 0) + 1;
  }

  return credentials.map((credential) => ({
    id: credential.id,
    communityId: credential.community_id,
    name: credential.name,
    description: credential.description,
    badgeType: mapValidityToBadgeType(credential.validity_mode),
    category: (credential.category as string) ?? "community_award",
    iconUrl: credential.icon_url,
    earnHint: (credential.earn_hint as string | null) ?? null,
    grantedCount: grantCounts[credential.id] ?? 0,
  }));
}

export async function createBadgeInDb(input: {
  communityId: string;
  name: string;
  description?: string;
  badgeType: BadgeType;
  category?: CredentialCategory;
  iconUrl?: string | null;
  earnHint?: string | null;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("credentials")
    .insert({
      community_id: input.communityId,
      name: input.name,
      description: input.description ?? null,
      validity_mode: badgeTypeToValidityMode(input.badgeType),
      category: input.category ?? "community_award",
      icon_url: input.iconUrl ?? null,
      earn_hint: input.earnHint?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data?.id as string };
}

export async function updateBadgeInDb(input: {
  badgeId: string;
  communityId: string;
  name: string;
  description?: string | null;
  badgeType: BadgeType;
  category?: CredentialCategory;
  iconUrl?: string | null;
  earnHint?: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("credentials")
    .update({
      name: input.name,
      description: input.description ?? null,
      validity_mode: badgeTypeToValidityMode(input.badgeType),
      category: input.category ?? "community_award",
      icon_url: input.iconUrl ?? null,
      earn_hint: input.earnHint?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.badgeId)
    .eq("community_id", input.communityId)
    .is("archived_at", null);

  if (error) return { error: error.message };
  return { error: null };
}

export async function archiveBadgeInDb(
  badgeId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("credentials")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", badgeId)
    .is("archived_at", null);

  if (!error) return { error: null };

  const { error: legacyError } = await supabase.from("badges").delete().eq("id", badgeId);
  if (legacyError) return { error: legacyError.message };
  return { error: null };
}

export async function grantBadgeInDb(input: {
  badgeId: string;
  userId: string;
  communityId: string;
  grantedBy: string;
}): Promise<{ error: string | null }> {
  const credentialResult = await grantCredentialInDb({
    credentialId: input.badgeId,
    userId: input.userId,
    grantedBy: input.grantedBy,
    sourceType: "manual_grant",
  });
  if (!credentialResult.error) return { error: null };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("user_badges").upsert(
    {
      user_id: input.userId,
      badge_id: input.badgeId,
      community_id: input.communityId,
      granted_by: input.grantedBy,
    },
    { onConflict: "user_id,badge_id" },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export type CommunityAwardGrantActivity = {
  id: string;
  grantedAt: string;
  recipientId: string;
  recipientName: string;
  recipientUsername: string | null;
  badgeId: string;
  badgeName: string;
  badgeDescription: string | null;
  badgeType: BadgeType;
  iconUrl: string | null;
  category: string;
};

/** Letzte Auszeichnungs-Vergaben in einer Community — für Social Proof auf der Übersicht */
export async function fetchRecentCommunityAwardGrants(
  communityId: string,
  limit = 8,
): Promise<CommunityAwardGrantActivity[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: credentialRows } = await supabase
    .from("credentials")
    .select("id")
    .eq("community_id", communityId)
    .is("archived_at", null);

  const credentialIds = (credentialRows ?? []).map((row) => row.id as string);
  if (credentialIds.length === 0) return [];

  const { data: rows, error } = await supabase
    .from("user_credentials")
    .select(
      `
      id,
      granted_at,
      user_id,
      snapshot_name,
      snapshot_description,
      snapshot_icon_url,
      credential:credentials (
        id,
        name,
        description,
        validity_mode,
        category,
        icon_url
      ),
      recipient:profiles!user_credentials_user_id_fkey (
        display_name,
        username
      )
    `,
    )
    .in("credential_id", credentialIds)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false })
    .limit(limit);

  if (error || !rows) return [];

  return rows
    .map((row): CommunityAwardGrantActivity | null => {
      const credentialRaw = row.credential;
      const credential = Array.isArray(credentialRaw) ? credentialRaw[0] : credentialRaw;
      const recipientRaw = row.recipient;
      const recipient = Array.isArray(recipientRaw) ? recipientRaw[0] : recipientRaw;

      const snapName = row.snapshot_name as string | null;
      const snapDesc = row.snapshot_description as string | null;
      const snapIcon = row.snapshot_icon_url as string | null;
      const badgeName = snapName ?? (credential?.name as string) ?? "Auszeichnung";

      const displayName = (recipient?.display_name as string | null)?.trim();
      const username = (recipient?.username as string | null)?.trim() ?? null;
      const recipientName = displayName || username || "Mitglied";

      return {
        id: row.id as string,
        grantedAt: row.granted_at as string,
        recipientId: row.user_id as string,
        recipientName,
        recipientUsername: username,
        badgeId: (credential?.id as string) ?? (row.id as string),
        badgeName,
        badgeDescription: snapDesc ?? (credential?.description as string | null) ?? null,
        badgeType: mapValidityToBadgeType((credential?.validity_mode as string) ?? "permanent"),
        iconUrl: snapIcon ?? (credential?.icon_url as string | null) ?? null,
        category: (credential?.category as string) ?? "community_award",
      };
    })
    .filter((item): item is CommunityAwardGrantActivity => Boolean(item));
}

export type UserAwardVisibility = "public" | "private" | "archived";

export type UserAwardView = {
  id: string;
  badgeId: string;
  name: string;
  description: string | null;
  category: string;
  badgeType: BadgeType;
  communityId: string;
  communityTitle: string;
  communitySlug: string;
  grantedAt: string;
  grantedByName: string | null;
  sourceType: string | null;
  visibility?: UserAwardVisibility;
  iconUrl?: string | null;
  isCollectionQualification?: boolean;
  collectionCredentialCount?: number;
};

async function fetchCompletedCollectionQualifications(
  userId: string,
): Promise<UserAwardView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: userCreds, error: credError } = await supabase
    .from("user_credentials")
    .select("credential_id, granted_at")
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (credError || !userCreds?.length) return [];

  const ownedIds = new Set(userCreds.map((r) => r.credential_id as string));
  const grantedAtByCredential = new Map<string, string>();
  for (const row of userCreds) {
    grantedAtByCredential.set(row.credential_id as string, row.granted_at as string);
  }

  const { data: collections, error: collError } = await supabase
    .from("credential_collections")
    .select(
      `
      id,
      name,
      description,
      community:communities (
        id,
        title,
        slug
      )
    `,
    );

  if (collError || !collections?.length) return [];

  const collectionIds = collections.map((c) => c.id as string);
  const { data: items } = await supabase
    .from("credential_collection_items")
    .select("collection_id, credential_id")
    .in("collection_id", collectionIds);

  const itemsByCollection = new Map<string, string[]>();
  for (const row of items ?? []) {
    const collectionId = row.collection_id as string;
    if (!itemsByCollection.has(collectionId)) itemsByCollection.set(collectionId, []);
    itemsByCollection.get(collectionId)!.push(row.credential_id as string);
  }

  const qualifications: UserAwardView[] = [];

  for (const collection of collections) {
    const collectionId = collection.id as string;
    const credentialIds = itemsByCollection.get(collectionId) ?? [];
    if (credentialIds.length === 0) continue;
    if (!credentialIds.every((id) => ownedIds.has(id))) continue;

    const communityRaw = collection.community;
    const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;
    if (!community) continue;

    const latestGrant = credentialIds
      .map((id) => grantedAtByCredential.get(id))
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

    qualifications.push({
      id: `collection-${collectionId}`,
      badgeId: collectionId,
      name: collection.name as string,
      description: (collection.description as string) ?? null,
      category: "certificate",
      badgeType: "permanent",
      communityId: community.id as string,
      communityTitle: community.title as string,
      communitySlug: community.slug as string,
      grantedAt: latestGrant ?? new Date().toISOString(),
      grantedByName: null,
      sourceType: "collection_completion",
      isCollectionQualification: true,
      collectionCredentialCount: credentialIds.length,
    });
  }

  return qualifications;
}

export async function fetchUserAwardsForProfile(
  userId: string,
): Promise<UserAwardView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: credentialRows, error: credentialError } = await supabase
    .from("user_credentials")
    .select(
      `
      id,
      granted_at,
      source_type,
      visibility,
      snapshot_name,
      snapshot_description,
      snapshot_icon_url,
      credential:credentials (
        id,
        name,
        description,
        validity_mode,
        category,
        icon_url
      ),
      community:communities (
        id,
        title,
        slug
      ),
      granter:profiles!user_credentials_granted_by_fkey (
        display_name,
        username
      )
    `,
    )
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });

  if (!credentialError && credentialRows && credentialRows.length > 0) {
    const individual: UserAwardView[] = credentialRows
      .map((row): UserAwardView | null => {
        const credentialRaw = row.credential;
        const credential = Array.isArray(credentialRaw) ? credentialRaw[0] : credentialRaw;
        const communityRaw = row.community;
        const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;
        const granterRaw = row.granter;
        const granter = Array.isArray(granterRaw) ? granterRaw[0] : granterRaw;
        if (!community) return null;

        const grantedByName =
          (granter?.display_name as string | null) ??
          (granter?.username as string | null) ??
          null;

        const snapName = row.snapshot_name as string | null;
        const snapDesc = row.snapshot_description as string | null;
        const snapIcon = row.snapshot_icon_url as string | null;

        return {
          id: row.id as string,
          badgeId: (credential?.id as string) ?? row.id as string,
          name: snapName ?? (credential?.name as string) ?? "Auszeichnung",
          description: snapDesc ?? (credential?.description as string | null) ?? null,
          category: (credential?.category as string) ?? "community_award",
          badgeType: mapValidityToBadgeType((credential?.validity_mode as string) ?? "permanent"),
          communityId: community.id as string,
          communityTitle: community.title as string,
          communitySlug: community.slug as string,
          grantedAt: row.granted_at as string,
          grantedByName,
          sourceType: (row.source_type as string) ?? null,
          visibility: (row.visibility as UserAwardVisibility) ?? "private",
          iconUrl: snapIcon ?? (credential?.icon_url as string | null) ?? null,
        };
      })
      .filter((a): a is UserAwardView => Boolean(a));

    const collections = await fetchCompletedCollectionQualifications(userId);
    return [...individual, ...collections].sort(
      (a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime(),
    );
  }

  const { data, error } = await supabase
    .from("user_badges")
    .select(
      `
      id,
      created_at,
      badge:badges (
        id,
        name,
        badge_type
      ),
      community:communities (
        id,
        title,
        slug
      ),
      granter:profiles!user_badges_granted_by_fkey (
        display_name,
        username
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[badge.repository] profile awards:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row): UserAwardView | null => {
      const badgeRaw = row.badge;
      const badge = Array.isArray(badgeRaw) ? badgeRaw[0] : badgeRaw;
      const communityRaw = row.community;
      const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;
      const granterRaw = row.granter;
      const granter = Array.isArray(granterRaw) ? granterRaw[0] : granterRaw;
      if (!badge || !community) return null;

      const grantedByName =
        (granter?.display_name as string | null) ??
        (granter?.username as string | null) ??
        null;

      return {
        id: row.id as string,
        badgeId: badge.id as string,
        name: badge.name as string,
        description: null,
        category: "legacy",
        badgeType: badge.badge_type as BadgeType,
        communityId: community.id as string,
        communityTitle: community.title as string,
        communitySlug: community.slug as string,
        grantedAt: row.created_at as string,
        grantedByName,
        sourceType: "legacy_badge",
      };
    })
    .filter((a): a is UserAwardView => Boolean(a));
}

export type MemberCommunityAwardView = {
  id: string;
  name: string;
  badgeType: BadgeType;
  iconUrl: string | null;
};

export async function fetchUserBadgesForCommunity(
  communityId: string,
  userIds: string[],
  options?: { publicOnly?: boolean },
): Promise<Record<string, MemberCommunityAwardView[]>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = await createClient();
  if (!supabase) return {};

  let query = supabase
    .from("user_credentials")
    .select(
      `
      user_id,
      visibility,
      snapshot_name,
      snapshot_icon_url,
      credential:credentials (
        id,
        name,
        validity_mode,
        icon_url
      )
    `,
    )
    .eq("community_id", communityId)
    .in("user_id", unique)
    .is("revoked_at", null);

  if (options?.publicOnly !== false) {
    query = query.eq("visibility", "public");
  }

  const { data, error } = await query;

  if (!error && data) {
    const result: Record<string, MemberCommunityAwardView[]> = {};
    for (const row of data) {
      const userId = row.user_id as string;
      const credentialRaw = row.credential;
      const credential = Array.isArray(credentialRaw) ? credentialRaw[0] : credentialRaw;
      if (!credential) continue;

      const snapName = row.snapshot_name as string | null;
      const snapIcon = row.snapshot_icon_url as string | null;

      if (!result[userId]) result[userId] = [];
      result[userId].push({
        id: credential.id as string,
        name: snapName ?? (credential.name as string),
        badgeType: mapValidityToBadgeType(credential.validity_mode as string),
        iconUrl: snapIcon ?? (credential.icon_url as string | null) ?? null,
      });
    }
    if (Object.keys(result).length > 0 || data.length === 0) {
      return result;
    }
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("user_badges")
    .select(
      `
      user_id,
      badge:badges (
        id,
        name,
        badge_type
      )
    `,
    )
    .eq("community_id", communityId)
    .in("user_id", unique);

  if (legacyError) {
    console.error("[badge.repository] user badges:", legacyError.message);
    return {};
  }

  const legacyResult: Record<string, MemberCommunityAwardView[]> = {};
  for (const row of legacyData ?? []) {
    const userId = row.user_id as string;
    const badgeRaw = row.badge;
    const badge = Array.isArray(badgeRaw) ? badgeRaw[0] : badgeRaw;
    if (!badge) continue;
    if (!legacyResult[userId]) legacyResult[userId] = [];
    legacyResult[userId].push({
      id: badge.id as string,
      name: badge.name as string,
      badgeType: badge.badge_type as BadgeType,
      iconUrl: null,
    });
  }

  return legacyResult;
}

export async function fetchPublicUserAwards(
  userId: string,
): Promise<UserAwardView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: credentialRows, error } = await supabase
    .from("user_credentials")
    .select(
      `
      id,
      granted_at,
      source_type,
      visibility,
      snapshot_name,
      snapshot_description,
      snapshot_icon_url,
      credential:credentials (
        id,
        name,
        description,
        validity_mode,
        category,
        icon_url
      ),
      community:communities (
        id,
        title,
        slug
      )
    `,
    )
    .eq("user_id", userId)
    .eq("visibility", "public")
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });

  if (error) {
    console.error("[badge.repository] public awards:", error.message);
    return [];
  }

  return (credentialRows ?? [])
    .map((row): UserAwardView | null => {
      const credentialRaw = row.credential;
      const credential = Array.isArray(credentialRaw) ? credentialRaw[0] : credentialRaw;
      const communityRaw = row.community;
      const community = Array.isArray(communityRaw) ? communityRaw[0] : communityRaw;
      if (!community) return null;

      const snapName = row.snapshot_name as string | null;
      const snapDesc = row.snapshot_description as string | null;
      const snapIcon = row.snapshot_icon_url as string | null;

      return {
        id: row.id as string,
        badgeId: (credential?.id as string) ?? (row.id as string),
        name: snapName ?? (credential?.name as string) ?? "Auszeichnung",
        description: snapDesc ?? (credential?.description as string | null) ?? null,
        category: (credential?.category as string) ?? "community_award",
        badgeType: mapValidityToBadgeType((credential?.validity_mode as string) ?? "permanent"),
        communityId: community.id as string,
        communityTitle: community.title as string,
        communitySlug: community.slug as string,
        grantedAt: row.granted_at as string,
        grantedByName: null,
        sourceType: (row.source_type as string) ?? null,
        visibility: "public",
        iconUrl: snapIcon ?? (credential?.icon_url as string | null) ?? null,
      };
    })
    .filter((a): a is UserAwardView => Boolean(a));
}

export async function updateUserCredentialVisibilityInDb(input: {
  userId: string;
  userCredentialId: string;
  visibility: "public" | "private";
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("user_credentials")
    .update({ visibility: input.visibility })
    .eq("id", input.userCredentialId)
    .eq("user_id", input.userId)
    .is("revoked_at", null);

  if (error) return { error: error.message };
  return { error: null };
}
