"use server";

import { isValidGroupSlug, parseTagsInput, slugifyTitle } from "@/lib/utils/slug";
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
  followGroup,
  followEvent,
  unfollowCommunity,
  unfollowGroup,
  unfollowEvent,
} from "@/services/follow/follow.service";
import type { CommunityFormInput } from "@/types/community";
import { resolveBannerFromPresetOrUrl } from "@/lib/constants/category-banners";
import { revalidateDiscover } from "@/lib/cache/revalidate-discover";
import { discoverEnabledForVisibility } from "@/lib/community/visibility-rules";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadCommunityBanner } from "@/services/user/banner.service";

function parseCommunityForm(formData: FormData): CommunityFormInput {
  const category = String(formData.get("category") ?? "Allgemein");
  const customBannerUrl = String(formData.get("bannerUrl") ?? "").trim();
  const bannerPresetId = String(formData.get("bannerPresetId") ?? "").trim() || undefined;
  const banner = resolveBannerFromPresetOrUrl({
    category,
    bannerUrl: customBannerUrl || undefined,
    bannerPresetId,
    bannerGradient: String(formData.get("bannerGradient") ?? ""),
  });

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").toLowerCase(),
    description: String(formData.get("description") ?? ""),
    platformType: String(formData.get("platformType") ?? "unze") as CommunityFormInput["platformType"],
    category,
    focusTags: parseTagsInput(String(formData.get("focusTags") ?? "")).slice(0, 6),
    tags: parseTagsInput(String(formData.get("tags") ?? "")).slice(0, 8),
    visibility: String(formData.get("visibility") ?? "public") as CommunityFormInput["visibility"],
    bannerGradient: banner.gradient,
    bannerPresetId: banner.presetId,
    bannerUrl: banner.imageUrl,
    externalUrl: String(formData.get("externalUrl") ?? "").trim() || undefined,
    discoverEnabled: discoverEnabledForVisibility(
      String(formData.get("visibility") ?? "public") as CommunityFormInput["visibility"],
      formData.get("discoverEnabled") === "on",
    ),
  };
}

export async function createCommunityAction(
  _prev: { error?: string; redirectTo?: string } | null,
  formData: FormData,
): Promise<{ error?: string; redirectTo?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Bitte melde dich an, um eine Community zu erstellen." };
  }

  let bannerUrlFromUpload: string | undefined;
  const bannerFile = formData.get("bannerFile");
  if (bannerFile instanceof File && bannerFile.size > 0) {
    const buffer = Buffer.from(await bannerFile.arrayBuffer());
    const uploaded = await uploadCommunityBanner({
      userId: user.id,
      buffer,
      fileName: bannerFile.name,
      mimeType: bannerFile.type || "image/jpeg",
    });
    if (uploaded.error || !uploaded.bannerUrl) {
      return { error: uploaded.error ?? "Banner konnte nicht hochgeladen werden." };
    }
    bannerUrlFromUpload = uploaded.bannerUrl;
  }

  const input = parseCommunityForm(formData);
  if (bannerUrlFromUpload) {
    input.bannerUrl = bannerUrlFromUpload;
  }

  if (!input.title.trim()) {
    return { error: "Bitte gib einen Titel für deine Community ein." };
  }

  const { community, error } = await createCommunity(input);
  if (error || !community) {
    return { error: error ?? "Die Community konnte aktuell nicht erstellt werden. Bitte erneut versuchen." };
  }

  revalidateDiscover();
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/community/${community.slug}`);
  revalidatePath(`/dashboard/community/${community.slug}/access`);

  return {
    redirectTo: `/dashboard/community/${community.slug}/access?welcome=1`,
  };
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
  revalidateDiscover();
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

export async function toggleFollowGroup(
  groupId: string,
  communitySlug: string,
  groupSlug: string,
  currentlyFollowing: boolean,
) {
  const result = currentlyFollowing
    ? await unfollowGroup(groupId)
    : await followGroup(groupId);

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath(`/community/${communitySlug}/group/${groupSlug}`);
  revalidatePath("/favorites");
  return { success: true };
}

export async function toggleFollowEvent(
  eventId: string,
  communitySlug: string,
  currentlyFollowing: boolean,
) {
  const result = currentlyFollowing
    ? await unfollowEvent(eventId)
    : await followEvent(eventId);

  if (result.error) {
    return { error: result.error.message };
  }

  revalidatePath(`/community/${communitySlug}`);
  revalidatePath("/favorites");
  revalidateDiscover();
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

  const groupType = (String(formData.get("groupType") ?? "group") === "service"
    ? "service"
    : "group") as "group" | "service";
  const priceRaw = String(formData.get("groupPriceCents") ?? "").trim();
  const priceCents = priceRaw ? Math.max(0, Math.round(Number(priceRaw) * 100)) : null;

  const group = await createCommunityGroup({
    communityId,
    slug: groupSlug,
    title,
    description: String(formData.get("groupDescription") ?? "").trim(),
    isPublic: formData.get("groupIsPublic") === "on",
    groupType,
    priceCents: Number.isFinite(priceCents as number) ? priceCents : null,
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
