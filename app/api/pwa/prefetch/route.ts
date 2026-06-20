import { getCurrentUser, getCurrentProfile } from "@/services/auth/auth.service";
import { getMyMemberCommunities } from "@/services/home/home.service";
import { getUpcomingEventsForUser } from "@/services/events/event.service";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/services/notifications/notification-center.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Leichtgewichtiger Warmup für installierte PWA (Hintergrund).
 * Keine Creator-/Stripe-/Referral-Daten.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [profile, unreadCount, notifications, communities, events] = await Promise.all([
    getCurrentProfile(),
    getUnreadNotificationCount(user.id),
    getNotifications(user.id, { limit: 8 }),
    getMyMemberCommunities(user.id),
    getUpcomingEventsForUser(user.id, 5),
  ]);

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    unreadCount,
    profile: profile
      ? {
          displayName: profile.display_name ?? null,
          avatarUrl: profile.avatar_url ?? null,
        }
      : null,
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      createdAt: n.createdAt,
    })),
    memberCommunities: communities.slice(0, 6).map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
    })),
    upcomingEventCount: events.length,
  });
}
