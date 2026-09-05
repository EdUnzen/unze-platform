import type { NotificationItem } from "@/types/governance";

/** Leitet Notification-Payload zu klickbaren App-Routen */
export function resolveNotificationHref(
  notification: NotificationItem,
): string | null {
  const data = notification.data ?? {};
  const communitySlug = data.communitySlug as string | undefined;
  const communityId = data.communityId as string | undefined;
  const slug = communitySlug ?? (data.slug as string | undefined);
  const linkHref = data.linkHref as string | undefined;

  if (linkHref) return linkHref;

  switch (notification.category) {
    case "application":
      if (slug) return `/dashboard/community/${slug}/requests`;
      if (communityId) return "/dashboard";
      return "/notifications";
    case "moderation":
      if (slug) return `/dashboard/community/${slug}/moderation`;
      return "/notifications";
    case "invite":
      if (data.code) return `/invite/${data.code as string}`;
      if (slug) return `/community/${slug}`;
      return "/discover";
    case "community_event":
      if (slug) return `/community/${slug}`;
      if (slug && notification.type?.includes("dashboard")) {
        return `/dashboard/community/${slug}`;
      }
      return slug ? `/community/${slug}` : "/dashboard";
    case "system":
      if (notification.type?.includes("verification")) {
        return "/dashboard/verification";
      }
      if (slug) return `/community/${slug}`;
      return null;
    default:
      return slug ? `/community/${slug}` : null;
  }
}

export function getNotificationActionLabel(
  notification: NotificationItem,
): string | null {
  const href = resolveNotificationHref(notification);
  if (!href) return null;

  switch (notification.category) {
    case "application":
      return "Antrag ansehen";
    case "moderation":
      return "Moderation öffnen";
    case "invite":
      return "Einladung öffnen";
    case "community_event":
      if (notification.type === "badge.granted" && notification.data?.linkHref) {
        return "Auszeichnungen ansehen";
      }
      if (notification.type === "role.changed" && notification.data?.linkHref) {
        return "Community öffnen";
      }
      return "Community öffnen";
    case "system":
      return "Details ansehen";
    default:
      return "Öffnen";
  }
}
