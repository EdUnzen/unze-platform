"use server";

import { isValidCommunitySlug, isValidGroupSlug, parseTagsInput, slugifyTitle } from "@/lib/utils/slug";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  createCommunity,
  updateCommunity,
} from "@/services/community/community.service";
import {
  createCommunityGroup,
  deleteCommunityGroup,
} from "@/services/community/group.service";
import { fetchCommunityBySlugFromDb } from "@/services/community/community.repository";
import {
  canEditCommunity,
  leaveCommunity,
} from "@/services/community/member.service";
import {
  followCommunity,
  unfollowCommunity,
} from "@/services/follow/follow.service";
import type { CommunityFormInput } from "@/types/community";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseCommunityForm(formData: FormData): CommunityFormInput {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").toLowerCase(),
    description: String(formData.get("description") ?? ""),
    platformType: String(formData.get("platformType") ?? "unze") as CommunityFormInput["platformType"],
    category: String(formData.get("category") ?? "Allgemein"),
    tags: parseTagsInput(String(formData.get("tags") ?? "")),
    visibility: String(formData.get("visibility") ?? "public") as CommunityFormInput["visibility"],
    bannerGradient: String(
      formData.get("bannerGradient") ??
        "from-emerald-500/90 via-teal-600/80 to-cyan-700/70",
    ),
    externalUrl: String(formData.get("externalUrl") ?? "").trim() || undefined,
    discoverEnabled: formData.get("discoverEnabled") === "on",
  };
}

export async function createCommunityAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const input = parseCommunityForm(formData);

  if (!input.title.trim()) {
    return { error: "Titel ist erforderlich" };
  }

  if (!isValidCommunitySlug(input.slug)) {
    return { error: "Ungültiger Slug (3–60 Zeichen, a-z, 0-9, -)" };
  }

  const { community, error } = await createCommunity(input);
  if (error || !community) {
    return { error: error ?? "Erstellung fehlgeschlagen" };
  }

  revalidatePath("/discover");
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/dashboard/community/${community.slug}/access?welcome=1`);
}

export async function updateCommunityAction(
  communityId: string,
  slug: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const existing = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!existing) return { error: "Community nicht gefunden" };

  if (!canEditCommunity(existing.membership?.role ?? null)) {
    return { error: "Keine Berechtigung zum Bearbeiten" };
  }

  const input = parseCommunityForm(formData);
  const { error } = await updateCommunity(communityId, input);

  if (error) return { error };

  revalidatePath(`/community/${slug}`);
  revalidatePath(`/community/${slug}/edit`);
  revalidatePath("/discover");
  redirect(`/community/${slug}`);
}

export async function toggleFollowCommunity(
  communityId: string,
  slug: string,
  currentlyFollowing: boolean,
) {
  const result = currentlyFollowing
    ? await unfollowCommunity(communityId)
    : await followCommunity(communityId);

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath(`/community/${slug}`);
  revalidatePath("/favorites");
  return { success: true };
}

export async function leaveCommunityAction(communityId: string, slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const community = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!community) return { error: "Community nicht gefunden" };

  const result = await leaveCommunity(
    communityId,
    user.id,
    community.membership?.role ?? null,
  );

  if (result.error) return { error: result.error };

  revalidatePath(`/community/${slug}`);
  return { success: true };
}

export async function createGroupAction(
  communityId: string,
  slug: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const community = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!community || !canEditCommunity(community.membership?.role ?? null)) {
    return { error: "Keine Berechtigung" };
  }

  const title = String(formData.get("groupTitle") ?? "").trim();
  const groupSlug = slugifyTitle(String(formData.get("groupSlug") ?? title));

  if (!title || !isValidGroupSlug(groupSlug)) {
    return { error: "Gruppe: Titel und gültiger Slug erforderlich" };
  }

  const group = await createCommunityGroup({
    communityId,
    slug: groupSlug,
    title,
    description: String(formData.get("groupDescription") ?? "").trim(),
    isPublic: formData.get("groupIsPublic") === "on",
  });

  if (!group) return { error: "Gruppe konnte nicht erstellt werden" };

  revalidatePath(`/community/${slug}`);
  revalidatePath(`/community/${slug}/edit`);
  return {};
}

export async function deleteGroupAction(
  groupId: string,
  communityId: string,
  slug: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const community = await fetchCommunityBySlugFromDb(slug, user.id);
  if (!community || !canEditCommunity(community.membership?.role ?? null)) {
    return { error: "Keine Berechtigung" };
  }

  const ok = await deleteCommunityGroup(groupId);
  if (!ok) return { error: "Löschen fehlgeschlagen" };

  revalidatePath(`/community/${slug}`);
  revalidatePath(`/community/${slug}/edit`);
  return {};
}

export async function suggestSlugAction(title: string) {
  return { slug: slugifyTitle(title) };
}
