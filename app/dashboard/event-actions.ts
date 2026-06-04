"use server";

import { createCommunityEvent } from "@/services/events/event.service";
import { getCurrentUser } from "@/services/auth/auth.service";
import { canEditCommunity } from "@/services/community/member.service";
import { fetchMembership } from "@/services/community/member.repository";
import { isValidCommunitySlug, slugifyTitle } from "@/lib/utils/slug";
import { revalidatePath } from "next/cache";

export async function createEventAction(
  communityId: string,
  slug: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const member = await fetchMembership(communityId, user.id);
  if (!canEditCommunity(member?.role ?? null)) return { error: "Keine Berechtigung" };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const externalUrl = String(formData.get("externalUrl") ?? "").trim() || null;
  let eventSlug = String(formData.get("eventSlug") ?? "").trim().toLowerCase();
  if (!eventSlug) eventSlug = slugifyTitle(title);

  if (!title) return { error: "Titel erforderlich" };
  if (!startsAt) return { error: "Startdatum erforderlich" };
  if (!isValidCommunitySlug(eventSlug)) {
    return { error: "Ungültiger Event-Slug" };
  }

  let coverUrl: string | undefined;
  const coverFile = formData.get("coverFile");
  if (coverFile instanceof File && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const { uploadEventCover } = await import("@/services/user/banner.service");
    const uploaded = await uploadEventCover({
      userId: user.id,
      buffer,
      fileName: coverFile.name,
      mimeType: coverFile.type || "image/jpeg",
    });
    if (uploaded.error) return { error: uploaded.error };
    coverUrl = uploaded.coverUrl ?? undefined;
  }

  const { error } = await createCommunityEvent({
    communityId,
    slug: eventSlug,
    title,
    description,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    location,
    externalUrl,
    isPublic: formData.get("isPublic") === "on",
    createdBy: user.id,
    coverUrl,
  });

  if (error) return { error };

  const { fetchCommunityTitleById } = await import(
    "@/services/community/community.repository"
  );
  const communityTitle = await fetchCommunityTitleById(communityId);

  const { publishPlatformEvent } = await import(
    "@/services/platform/event-bus.service"
  );
  await publishPlatformEvent({
    eventType: "community.event_published",
    actorId: user.id,
    communityId,
    subjectType: "event",
    payload: {
      eventTitle: title,
      communityTitle: communityTitle ?? slug,
      communitySlug: slug,
    },
  });

  revalidatePath(`/community/${slug}`);
  revalidatePath(`/dashboard/community/${slug}/events`);
  revalidatePath("/discover");
  return { success: true as const };
}
