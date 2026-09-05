import type { NotificationCategory } from "@/types/governance";

/** Serverseitige Ziel-URL für Push-Klicks (analog resolveNotificationHref) */
export function resolvePushUrl(input: {
  category: NotificationCategory;
  type?: string;
  data?: Record<string, unknown>;
}): string {
  const data = input.data ?? {};
  const linkHref = data.linkHref as string | undefined;
  if (linkHref) return linkHref;

  const communitySlug = data.communitySlug as string | undefined;
  const slug = communitySlug ?? (data.slug as string | undefined);

  switch (input.category) {
    case "application":
      if (slug) return `/dashboard/community/${slug}/requests`;
      return "/notifications";
    case "moderation":
      if (slug) return `/dashboard/community/${slug}/moderation`;
      return "/notifications";
    case "invite":
      if (data.code) return `/invite/${data.code as string}`;
      if (slug) return `/community/${slug}`;
      return "/discover";
    case "community_event":
      if (input.type === "badge.granted") return "/profile/auszeichnungen";
      if (slug) return `/community/${slug}`;
      return "/notifications";
    case "system":
      if (input.type?.includes("verification")) return "/dashboard/verification";
      if (slug) return `/community/${slug}`;
      return "/notifications";
    default:
      return slug ? `/community/${slug}` : "/notifications";
  }
}
